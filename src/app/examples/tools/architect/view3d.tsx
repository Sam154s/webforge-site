'use client'
// The 3D designer view, drawn the way an architect presents a concept: a white card model on a base board under an
// orthographic camera, ink outlines found from the depth and surface direction of every pixel (so roof valleys and
// junctions between blocks get a line with no geometry work), materials hinted by hatching, the site boundary in red,
// dimension lines on the ground, and true plan, elevation, section and exploded drawings from the same model.
// Three presentation styles share one build: card model, blueprint and evening.
// Real geometry built from the design with three.js, which is loaded only here, on the client.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type * as T from 'three'
import { OVERHANG, PLOT, dormerOf, frontBlock, roofAt, roofOf, slopes, solarArray, storeyH, type Block, type Design, type RoofGeo } from '@/lib/sandbox/architect-model'
import { northVector, sunVector, type Mark } from '@/lib/sandbox/architect-rules'
import type { Cladding } from '@/lib/sandbox/architect'

export type Shot = { src: string; label: string }
export type ViewName = 'axo' | 'front' | 'rear' | 'left' | 'right' | 'plan'
export type Mode = 'model' | 'blueprint' | 'evening'
export type Look = { view: ViewName; mode: Mode; section: number | null; explode: number; day: number; hour: number; marks: Mark[]; selected: string | null }
export type Shots = { hero: Shot; evening: Shot; plan: Shot; elevations: Shot[]; section: Shot; exploded: Shot; sun: Shot[] }
export type ViewHandle = { shots: () => Shots | null }
type Api = { set: (d: Design, look: Look, assemble?: boolean) => void; shots: (d: Design) => Shots; dispose: () => void }

const PAL = {
  model: { text: '#17191C', bg: '#F2F0EA', board: '#F0EDE6', road: '#E4E1DA', ink: '#17191C', red: '#B8322A', existing: '#D6D3CC', context: '#E5E2DB', roof: '#D6D3CC', roofOld: '#C6C3BC', glass: '#AEBCC4', glassOld: '#C9CDCC', door: '#8A8780',
    crown: '#F1EFEA', stick: '#A39F97', room: '#FBFAF7', earth: '#DDD9D0', panel: '#39424C', lineA: 0.85, edge: 0.92 },
  blueprint: { text: '#EAF2FA', bg: '#123A63', board: '#123A63', road: '#0F3359', ink: '#EAF2FA', red: '#F2B544', existing: '#164473', context: '#143E69', roof: '#1D5389', roofOld: '#184878', glass: '#3B78B4', glassOld: '#2A5F96', door: '#2C5C8F',
    crown: '#164473', stick: '#8FB0D2', room: '#123A63', earth: '#0F3359', panel: '#0B2545', lineA: 0.9, edge: 0.95 },
  evening: { text: '#DDE3EE', bg: '#1B2433', board: '#333D52', road: '#2A3345', ink: '#0B0E13', red: '#E0766C', existing: '#8F96A5', context: '#3B4354', roof: '#7F8695', roofOld: '#6F7685', glass: '#FFD79A', glassOld: '#F2C98C', door: '#4A4F5A',
    crown: '#4A5468', stick: '#5B6475', room: '#FFE2B0', earth: '#222938', panel: '#141A24', lineA: 0.9, edge: 0.9 },
} as const
const CARD: Record<Mode, Record<Cladding, string>> = {
  model: { brick: '#EFE5DD', timber: '#F0E7D6', zinc: '#DEE1E2', render: '#FAF8F4' },
  blueprint: { brick: '#1A4B7E', timber: '#1A4B7E', zinc: '#1A4B7E', render: '#1A4B7E' },
  evening: { brick: '#C4BEBC', timber: '#C7C1B6', zinc: '#AEB4BD', render: '#D2D5DC' },
}
const HATCH: Record<Mode, Record<Cladding, string>> = {
  model: { brick: '#B79E8F', timber: '#BDA67E', zinc: '#8E969A', render: '' },
  blueprint: { brick: '#5B8EC2', timber: '#5B8EC2', zinc: '#5B8EC2', render: '' },
  evening: { brick: '#8F8683', timber: '#93897A', zinc: '#7C838D', render: '' },
}
const GAP = 3.6           // metres between levels when fully exploded
const DIST = 90           // camera distance from its target
const AXO = [0.62, 0.52, 0.78] as const

async function create(host: HTMLDivElement, first: Design, firstLook: Look): Promise<Api> {
  const THREE = await import('three')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(2)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.autoClear = false
  host.prepend(renderer.domElement)

  const scene = new THREE.Scene()
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 400)
  let half = 15
  const controls = new OrbitControls(cam, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minZoom = 0.55; controls.maxZoom = 3.2
  controls.maxPolarAngle = Math.PI / 2 - 0.1
  let dirty = true
  controls.addEventListener('change', () => { dirty = true })

  // ---- outline pass: every solid is drawn once more as "which way it faces, how far away it is", and lines are found where that changes
  const dataRT = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })
  const dataMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, clipping: true, uniforms: { mid: { value: DIST } },
    vertexShader: `#include <clipping_planes_pars_vertex>
      varying vec3 vN; varying float vD;
      void main() { vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vN = normalMatrix * normal; vD = -mvPosition.z; gl_Position = projectionMatrix * mvPosition;
      #include <clipping_planes_vertex>
      }`,
    fragmentShader: `#include <clipping_planes_pars_fragment>
      uniform float mid; varying vec3 vN; varying float vD;
      void main() {
      #include <clipping_planes_fragment>
      vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n; gl_FragColor = vec4(n * 0.5 + 0.5, vD - mid); }`,
  })
  const edgeMat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { map: { value: dataRT.texture }, px: { value: new THREE.Vector2() }, ink: { value: new THREE.Color() }, strength: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D map; uniform vec2 px; uniform vec3 ink; uniform float strength; varying vec2 vUv;
      vec4 s(float x, float y) { return texture2D(map, vUv + vec2(x, y) * px); }
      void main() {
        vec4 c = s(0., 0.), l = s(-1., 0.), r = s(1., 0.), u = s(0., 1.), d = s(0., -1.);
        float crease = max(max(distance(c.xyz, l.xyz), distance(c.xyz, r.xyz)), max(distance(c.xyz, u.xyz), distance(c.xyz, d.xyz)));
        float step1 = abs(l.a + r.a - 2. * c.a) + abs(u.a + d.a - 2. * c.a);
        vec4 l2 = s(-2., 0.), r2 = s(2., 0.), u2 = s(0., 2.), d2 = s(0., -2.);
        float step2 = abs(l2.a + r2.a - 2. * c.a) + abs(u2.a + d2.a - 2. * c.a);
        float a = max(smoothstep(.22, .5, crease) * .78, max(smoothstep(.3, .7, step1), smoothstep(.9, 1.6, step2)));
        gl_FragColor = vec4(ink, a * strength);
        #include <colorspace_fragment>
      }`,
  })
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), edgeMat); quad.frustumCulled = false; quadScene.add(quad)
  const blank = new THREE.Color('#8080FF'), paper = new THREE.Color(PAL.model.bg)

  // ---- light
  const hemi = new THREE.HemisphereLight('#FFFFFF', '#F1EFEA', 1.75)
  const sunLight = new THREE.DirectionalLight('#FFFFFF', 1.6)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.set(4096, 4096)
  sunLight.shadow.bias = -0.0003
  sunLight.shadow.normalBias = 0.04
  sunLight.shadow.radius = 3
  Object.assign(sunLight.shadow.camera, { left: -44, right: 44, top: 44, bottom: -44, near: 1, far: 220 })
  const flat = new THREE.AmbientLight('#FFFFFF', 0)
  scene.add(hemi, sunLight, sunLight.target, flat)

  const clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
  let look: Look = firstLook, design = first, P: (typeof PAL)[Mode] = PAL[look.mode]
  const body = getComputedStyle(document.body).fontFamily

  // everything built for the current design and style is thrown away and rebuilt on change
  const junk: { dispose: () => void }[] = []
  const keep = <X extends { dispose: () => void }>(x: X) => { junk.push(x); return x }
  const matt = (color: string, o: Partial<T.MeshStandardMaterialParameters> = {}) => keep(new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, clipShadows: true, ...o }))
  const flatMat = (color: string, o: Partial<T.MeshBasicMaterialParameters> = {}) => keep(new THREE.MeshBasicMaterial({ color, ...o }))
  const ink = (opacity = 0.7, color: string = P.ink) => keep(new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
  const note = <O extends T.Object3D>(o: O) => { o.layers.set(1); return o }       // drawn after the outline pass, never outlined itself
  const segs = (pts: number[], mat: T.LineBasicMaterial) => {
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return note(new THREE.LineSegments(g, mat))
  }
  const edges = (geo: T.BufferGeometry, mat: T.LineBasicMaterial, angle = 1) => note(new THREE.LineSegments(keep(new THREE.EdgesGeometry(geo, angle)), mat))
  const sprites: T.Sprite[] = []
  const label = (text: string, h = 1.3, color: string = P.text, weight = 600) => {
    const cv = document.createElement('canvas'); cv.width = 640; cv.height = 128
    const c = cv.getContext('2d')!
    c.font = `${weight} 60px ${body}`; c.textAlign = 'center'; c.textBaseline = 'middle'
    c.lineWidth = 12; c.strokeStyle = P.bg; c.lineJoin = 'round'; c.strokeText(text, 320, 66)     // a paper halo keeps figures legible over lines
    c.fillStyle = color; c.fillText(text, 320, 66)
    const map = keep(new THREE.CanvasTexture(cv)); map.colorSpace = THREE.SRGBColorSpace
    const s = note(new THREE.Sprite(keep(new THREE.SpriteMaterial({ map, transparent: true, depthTest: false }))))
    s.userData.h = h; s.scale.set(h * 5, h, 1); s.renderOrder = 5; sprites.push(s)
    return s
  }
  const canvasTex = (size: number, draw: (c: CanvasRenderingContext2D) => void) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = size
    draw(cv.getContext('2d')!)
    const t = keep(new THREE.CanvasTexture(cv))
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
    return t
  }

  // ---- cladding: a tint and a drafting hatch. One tile covers `m` metres.
  type Clad = { tint: string; map?: T.Texture; m: [number, number] }
  let CLAD: Record<Cladding, Clad>
  const makeClad = (mode: Mode): Record<Cladding, Clad> => {
    const tile = (k: Cladding, draw: (c: CanvasRenderingContext2D) => void) => canvasTex(256, (c) => { c.fillStyle = CARD[mode][k]; c.fillRect(0, 0, 256, 256); c.strokeStyle = HATCH[mode][k]; draw(c) })
    return {
      brick: { tint: CARD[mode].brick, m: [0.9, 0.6], map: tile('brick', (c) => {
        c.lineWidth = 1.6
        for (let r = 0; r < 8; r++) {
          c.beginPath(); c.moveTo(0, r * 32 + 1); c.lineTo(256, r * 32 + 1); c.stroke()
          for (let b = 0; b < 4; b++) { const x = b * 64 + (r % 2 ? 32 : 0) + 1; c.beginPath(); c.moveTo(x, r * 32); c.lineTo(x, r * 32 + 32); c.stroke() }
        }
      }) },
      timber: { tint: CARD[mode].timber, m: [1.2, 1.2], map: tile('timber', (c) => {
        c.lineWidth = 1.6
        for (let b = 0; b < 8; b++) { c.beginPath(); c.moveTo(b * 32 + 1, 0); c.lineTo(b * 32 + 1, 256); c.stroke() }
      }) },
      zinc: { tint: CARD[mode].zinc, m: [1, 1], map: tile('zinc', (c) => {
        c.lineWidth = 3
        for (const x of [2, 130]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 256); c.stroke() }
      }) },
      render: { tint: CARD[mode].render, m: [1, 1] },
    }
  }

  let root: T.Group | null = null
  let lifts: { o: T.Object3D; i: number; y: number }[] = []       // parts that move in the exploded view
  let rises: { o: T.Object3D; t0: number }[] = []                 // blocks settling into place
  let caps: T.Group | null = null
  let board: T.Mesh | null = null, boardMat: T.MeshStandardMaterial | null = null, contact: T.Mesh | null = null, groundNotes: T.Group | null = null, levelNotes: T.Group | null = null
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ---- the site: base board, road, red line boundary, neighbours, model trees, north point, scale bar
  function buildSite(g: T.Group, d: Design, mode: Mode, ax: number, az: number, side: number) {
    const paper = mode === 'model' ? canvasTex(256, (c) => {
      c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, 256, 256)
      let seed = 7
      for (let i = 0; i < 2600; i++) { seed = (seed * 16807) % 2147483647; const x = seed % 256; seed = (seed * 16807) % 2147483647; const y = seed % 256; c.fillStyle = i % 3 ? 'rgba(90,80,60,.05)' : 'rgba(255,255,255,.5)'; c.fillRect(x, y, 1 + (i % 2), 1) }
    }) : undefined
    paper?.repeat.set(12, 10)
    const boardGeo = keep(new THREE.BoxGeometry(72, 1, 62))
    boardMat = matt(P.board, { map: paper })
    board = new THREE.Mesh(boardGeo, boardMat); board.position.y = -0.5; board.receiveShadow = true
    const road = new THREE.Mesh(keep(new THREE.PlaneGeometry(72, 7)), matt(P.road)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.012, 25); road.receiveShadow = true
    g.add(board, road)
    const marks = new THREE.Group(); groundNotes = marks; g.add(marks)
    marks.add(segs([-36, 0.02, 21.5, 36, 0.02, 21.5, -36, 0.02, 28.5, 36, 0.02, 28.5], ink(0.35, P.text)))
    if (mode === 'blueprint') {
      const pts: number[] = []
      for (let x = PLOT.x0; x <= PLOT.x1; x++) pts.push(x, 0.015, PLOT.z0, x, 0.015, PLOT.z1)
      for (let z = PLOT.z0; z <= PLOT.z1; z++) pts.push(PLOT.x0, 0.015, z, PLOT.x1, 0.015, z)
      marks.add(segs(pts, ink(0.5, '#2C5C8F')))
    }
    const redMat = flatMat(P.red)
    const cx = (PLOT.x0 + PLOT.x1) / 2, cz = (PLOT.z0 + PLOT.z1) / 2, w = PLOT.x1 - PLOT.x0, dp = PLOT.z1 - PLOT.z0
    for (const [x, z, bw, bd] of [[PLOT.x0, cz, 0.14, dp], [PLOT.x1, cz, 0.14, dp], [cx, PLOT.z0, w + 0.14, 0.14], [cx, PLOT.z1, w + 0.14, 0.14]]) {
      const b = note(new THREE.Mesh(keep(new THREE.BoxGeometry(bw, 0.04, bd)), redMat)); b.position.set(x, 0.03, z); marks.add(b)
    }
    const stick = matt(P.stick), crown = matt(P.crown)
    for (const [x, z, s] of [[-12.5, 11, 1], [-5, -16.5, 1.15], [12.5, -14, 0.9], [-27, -20, 1.1], [28, 15, 1], [-29, 12, 0.85]] as const) {
      const t = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.07, 0.07, 2.8 * s, 8)), stick); t.position.set(x, 1.4 * s, z); t.castShadow = true
      const c = new THREE.Mesh(keep(new THREE.SphereGeometry(1.15 * s, 32, 20)), crown); c.position.set(x, 3.3 * s, z); c.castShadow = true
      g.add(t, c)
    }
    // north point and a 10 metre scale bar, lying on the board like the marks on a drawing
    const n = northVector(d.facing), np = new THREE.Group(); np.position.set(ax, 0.03, az); np.rotation.y = Math.atan2(-n.x, -n.z)
    const arrow = new THREE.Shape(); arrow.moveTo(0, 1.7); arrow.lineTo(0.75, -1); arrow.lineTo(0, -0.45); arrow.lineTo(-0.75, -1); arrow.closePath()
    const head = note(new THREE.Mesh(keep(new THREE.ShapeGeometry(arrow)), flatMat(P.text))); head.rotation.x = -Math.PI / 2
    const ringPts: number[] = []
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, b = ((i + 1) / 48) * Math.PI * 2; ringPts.push(Math.cos(a) * 2.1, 0, Math.sin(a) * 2.1, Math.cos(b) * 2.1, 0, Math.sin(b) * 2.1) }
    np.add(head, segs(ringPts, ink(0.7, P.text)))
    const nText = label('N', 1.3); nText.position.set(ax + n.x * 3.1, 0.6, az + n.z * 3.1)
    marks.add(np, nText)
    for (let i = 0; i < 5; i++) {
      const b = note(new THREE.Mesh(keep(new THREE.BoxGeometry(2, 0.03, 0.34)), flatMat(i % 2 ? P.bg : P.text))); b.position.set(ax - 16.5 + i * 2, 0.03, az + 1.6 * side); marks.add(b)
    }
    const bx = ax - 17.5, bz = az + 1.6 * side
    marks.add(segs([bx, 0.03, bz - 0.17, bx + 10, 0.03, bz - 0.17, bx, 0.03, bz + 0.17, bx + 10, 0.03, bz + 0.17, bx, 0.03, bz - 0.17, bx, 0.03, bz + 0.17, bx + 10, 0.03, bz - 0.17, bx + 10, 0.03, bz + 0.17], ink(0.8, P.text)))
    const sText = label('10 m', 1); sText.position.set(bx + 5, 0.5, bz - 1.4 * side); marks.add(sText)
  }

  type Skin = 'new' | 'existing' | 'context'
  const sides = ['f', 'b', 'l', 'r'] as const
  type Side = (typeof sides)[number]

  // ---- one block: a box per storey so the model can come apart, openings, then the roof and whatever sits on it
  function volume(g: T.Group, d: Design, b: Block, skin: Skin, index: number) {
    const sh = storeyH(b), r = roofOf(d.blocks, b), fresh = skin === 'new'
    const clad: Clad | null = fresh ? CLAD[d.cladding] : null
    const tone = skin === 'context' ? P.context : skin === 'existing' ? P.existing : clad!.tint
    const cx = b.x + b.w / 2, cz = b.z + b.d / 2
    const wallMat = (len: number) => {
      const map = clad?.map ? keep(clad.map.clone()) : undefined
      if (map && clad) { map.repeat.set(len / clad.m[0], sh / clad.m[1]); map.needsUpdate = true }
      return matt(map ? '#FFFFFF' : tone, { map })
    }
    const cut = look.section !== null && skin !== 'context'
    const plain = matt(tone), inside = cut ? matt(look.mode === 'model' ? '#F4F1EB' : tone, { side: THREE.BackSide }) : null
    const line = ink(fresh ? P.lineA : skin === 'existing' ? 0.5 : 0.28)
    const evening = look.mode === 'evening'
    const glass = keep(new THREE.MeshStandardMaterial({ color: fresh ? P.glass : P.glassOld, roughness: 0.25, metalness: 0.1, clipShadows: true,
      emissive: evening && skin !== 'context' ? '#FFC978' : '#000000', emissiveIntensity: evening ? (fresh ? 1.5 : 0.75) : 0 }))
    const clear = keep(new THREE.MeshStandardMaterial({ color: P.glass, roughness: 0.2, transparent: true, opacity: 0.38, depthWrite: false, clipShadows: true }))
    const doorMat = matt(fresh ? P.door : P.roofOld)
    const vg = new THREE.Group(); vg.position.set(cx, 0, cz); g.add(vg)
    if (index >= 0) rises.push({ o: vg, t0: index * 90 })
    const has = (k: string) => skin !== 'context' && d.features.some((f) => f.key === k && f.block === b.id)
    const level = (i: number) => { const lg = new THREE.Group(); vg.add(lg); if (skin !== 'context') lifts.push({ o: lg, i, y: 0 }); return lg }
    const others = d.blocks.filter((o) => o !== b)
    const hidden = (x: number, z: number, s: number) => others.some((o) => (s < 0 ? o.basement : s < o.storeys) && x > o.x && x < o.x + o.w && z > o.z && z < o.z + o.d)
    const flen = (f: Side) => (f === 'f' || f === 'b' ? b.w : b.d)
    // put something on a wall: `along` runs left to right, `out` is how far it stands proud
    const onWall = (o: T.Object3D, f: Side, along: number, y: number, out = 0) => {
      if (f === 'f') o.position.set(along, y, b.d / 2 + out)
      if (f === 'b') { o.position.set(along, y, -b.d / 2 - out); o.rotation.y = Math.PI }
      if (f === 'r') { o.position.set(b.w / 2 + out, y, along); o.rotation.y = Math.PI / 2 }
      if (f === 'l') { o.position.set(-b.w / 2 - out, y, along); o.rotation.y = -Math.PI / 2 }
      return o
    }
    const outside = (f: Side, along: number, s: number) => {
      const p = onWall(new THREE.Object3D(), f, along, 0, 0.3).position
      return !hidden(cx + p.x, cz + p.z, s)
    }
    const openFace = (s: number, order: Side[]) => order.find((f) => outside(f, 0, s)) ?? null
    const pane = (parent: T.Object3D, f: Side, along: number, y: number, ow: number, oh: number, mat: T.Material, bars = 0, proud = 0.04) => {
      const geo = keep(new THREE.BoxGeometry(ow, oh, proud * 2)), o = new THREE.Group()
      o.add(new THREE.Mesh(geo, mat), edges(geo, line))
      const pts: number[] = []
      for (let i = 1; i <= bars; i++) { const x = -ow / 2 + (ow * i) / (bars + 1); pts.push(x, -oh / 2, proud + 0.005, x, oh / 2, proud + 0.005) }
      if (pts.length) o.add(segs(pts, line))
      parent.add(onWall(o, f, along, y + oh / 2))
      return o
    }
    const box = (parent: T.Object3D, w: number, h: number, dp: number, mat: T.Material, x: number, y: number, z: number, shadow = true) => {
      const geo = keep(new THREE.BoxGeometry(w, h, dp)), m = new THREE.Mesh(geo, mat), e = edges(geo, line)
      m.position.set(x, y, z); e.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true
      parent.add(m, e); return m
    }

    const front = skin !== 'context' && frontBlock(d)?.id === b.id
    const tallFace = has('tall') ? openFace(1, ['b', 'l', 'r']) : null
    const tallW = tallFace ? Math.min(flen(tallFace) - 1.2, 4.4) : 0
    const size = { modest: [1.0, 1.2, 0.95], generous: [1.5, 1.6, 0.7], full: [2.1, 2.3, 0.08] }[fresh ? d.glazing : 'modest']

    if (b.basement) {
      const lg = level(-1)
      const m = box(lg, b.w - 0.02, sh, b.d - 0.02, matt(look.mode === 'model' ? '#E4E0D8' : tone), 0, -sh / 2, 0, false); m.receiveShadow = false
      // lightwell: a strip of pavement glass on the garden side
      const lw = new THREE.Mesh(keep(new THREE.BoxGeometry(Math.min(b.w * 0.5, 4), 0.06, 0.9)), glass); lw.position.set(0, 0.03, -b.d / 2 - 0.55)
      const le = edges(lw.geometry, line); le.position.copy(lw.position)
      if (!hidden(cx, b.z - 0.55, 0)) vg.add(lw, le)
    }
    for (let s = 0; s < b.storeys; s++) {
      const lg = level(s), y0 = s * sh
      const geo = keep(new THREE.BoxGeometry(b.w, sh, b.d)), mz = wallMat(b.w), mx = wallMat(b.d)
      const walls = new THREE.Mesh(geo, [mx, mx, plain, plain, mz, mz])
      walls.position.y = y0 + sh / 2; walls.castShadow = walls.receiveShadow = true
      const we = edges(geo, line); we.position.y = y0 + sh / 2
      lg.add(walls, we)
      // with the section on, a plain lining shows the inside of the model through the cut
      if (inside) { const li = new THREE.Mesh(keep(new THREE.BoxGeometry(b.w - 0.02, sh - 0.02, b.d - 0.02)), inside); li.position.y = y0 + sh / 2; li.receiveShadow = true; lg.add(li) }
      if (skin === 'context') continue
      for (const f of sides) {
        const len = flen(f)
        if (b.role === 'garage') { if (f === 'f' && s === 0 && outside(f, 0, 0)) pane(lg, f, 0, 0.02, Math.min(2.6, len - 0.6), 1.95, doorMat, 3); continue }
        if (b.role === 'garden') { if (f === 'f' && outside(f, 0, 0)) pane(lg, f, 0, 0.1, len - 1, 1.9, glass, Math.max(1, Math.round(len / 1.3) - 1)); continue }
        const bays = Math.max(1, Math.round(len / (f === 'f' || f === 'b' ? 2.7 : 3.4)))
        const bay = len / bays, ow = Math.min(size[0], bay - 0.7)
        if (f === tallFace && s < 2) { pane(lg, f, 0, y0 + (s === 0 ? 0.12 : -0.12), tallW, sh - (s === 0 ? 0.24 : 0.5), glass, Math.max(1, Math.round(tallW / 1.1) - 1), 0.05) }
        for (let i = 0; i < bays; i++) {
          const along = -len / 2 + (i + 0.5) * bay
          if (!outside(f, along, s)) continue
          if (f === tallFace && s < 2 && Math.abs(along) < tallW / 2 + ow / 2 + 0.3) continue
          if (front && f === 'f' && s === 0 && i === Math.floor(bays / 2)) { pane(lg, f, along, 0.02, 1.05, 2.1, doorMat); continue }
          if (front && f === 'f' && s === 0 && i === 0 && has('bay') && bays > 1) continue
          if (has('balcony') && s === 1 && f === openFace(1, ['b', 'l', 'r', 'f']) && Math.abs(along) < 1.6) continue
          if (ow > 0.4) pane(lg, f, along, y0 + size[2] + (s === 0 ? 0.1 : 0), ow, Math.min(size[1], sh - size[2] - 0.3), glass, ow > 1.3 ? 1 : 0)
        }
      }
      // things that stand on a wall
      if (s === 0 && front && has('porch')) {
        const bays = Math.max(1, Math.round(b.w / 2.7)), along = -b.w / 2 + (Math.floor(bays / 2) + 0.5) * (b.w / bays), z = b.d / 2 + 0.7
        box(lg, 0.12, 2.5, 1.4, plain, along - 0.94, 1.25, z); box(lg, 0.12, 2.5, 1.4, plain, along + 0.94, 1.25, z); box(lg, 2.2, 0.16, 1.55, plain, along, 2.6, z + 0.05)
      }
      if (s === 0 && front && has('bay') && Math.round(b.w / 2.7) > 1) {
        const bays = Math.round(b.w / 2.7), along = -b.w / 2 + 0.5 * (b.w / bays), z = b.d / 2 + 0.35
        box(lg, 2.2, 0.5, 0.7, plain, along, 0.25, z); box(lg, 2.3, 0.14, 0.8, plain, along, 2.37, z)
        box(lg, 2.1, 1.8, 0.6, glass, along, 1.4, z, false)
      }
      if (s === 1 && has('balcony')) {
        const f = openFace(1, ['b', 'l', 'r', 'f'])
        if (f) {
          const o = new THREE.Group(); lg.add(onWall(o, f, 0, y0, 0))
          box(o, 3.2, 0.16, 1.3, plain, 0, -0.02, 0.65)
          for (const [w, dp, x, z] of [[3.1, 0.03, 0, 1.26], [0.03, 1.2, -1.55, 0.66], [0.03, 1.2, 1.55, 0.66]]) box(o, w, 1.1, dp, clear, x, 0.6, z, false)
          pane(lg, f, 0, y0 + 0.08, 2.4, 2.15, glass, 2, 0.05)
        }
      }
    }

    // ---- roof
    const rg = level(b.storeys); rg.position.y = 0
    const roofMat = matt(fresh ? P.roof : skin === 'existing' ? P.roofOld : P.context, { side: THREE.DoubleSide })
    const o = OVERHANG, h = r.eave
    let roof: T.Mesh
    if (b.roof === 'flat') {
      roof = new THREE.Mesh(keep(new THREE.BoxGeometry(b.w + 0.24, 0.3, b.d + 0.24)), roofMat)
      roof.position.y = h + 0.15
    } else if (b.roof === 'hip') {
      const a = r.span / 2 + o, e = r.run / 2 + o, q = Math.max(0.01, (r.run - r.span) / 2), rh = r.rise
      const V = (x: number, y: number, z: number) => (r.along ? [z, y, x] : [x, y, z])
      const tri = [
        [V(-a, 0, -e), V(-a, 0, e), V(0, rh, q)], [V(-a, 0, -e), V(0, rh, q), V(0, rh, -q)],
        [V(a, 0, e), V(a, 0, -e), V(0, rh, -q)], [V(a, 0, e), V(0, rh, -q), V(0, rh, q)],
        [V(-a, 0, e), V(a, 0, e), V(0, rh, q)], [V(a, 0, -e), V(-a, 0, -e), V(0, rh, -q)],
        [V(-a, 0, -e), V(a, 0, -e), V(a, 0, e)], [V(-a, 0, -e), V(a, 0, e), V(-a, 0, e)],
      ].flat(2)
      const geo = keep(new THREE.BufferGeometry())
      geo.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3)); geo.computeVertexNormals()
      roof = new THREE.Mesh(geo, roofMat); roof.position.y = h
    } else {
      const a = r.span / 2 + o, shape = new THREE.Shape()
      shape.moveTo(-a, 0); shape.lineTo(a, 0)
      shape.lineTo(b.roof === 'gable' ? 0 : r.along ? a : -a, r.rise); shape.closePath()
      const geo = keep(new THREE.ExtrudeGeometry(shape, { depth: r.run + o * 2, bevelEnabled: false }))
      geo.translate(0, 0, -(r.run / 2 + o))
      roof = new THREE.Mesh(geo, [plain, roofMat])      // gable ends take the wall tone, slopes take the roof
      roof.position.y = h
      if (r.along) roof.rotation.y = Math.PI / 2
    }
    roof.castShadow = roof.receiveShadow = true
    const re = edges(roof.geometry, line, 20)
    re.position.copy(roof.position); re.rotation.copy(roof.rotation)
    rg.add(roof, re)
    if (skin === 'context') return

    // seat something on a roof slope: `side` is -1 for the garden (or left) slope, +1 for the road (or right) slope
    const a = r.span / 2 + o
    const tilt = b.roof === 'flat' ? 0 : Math.atan(r.rise / (b.roof === 'mono' ? 2 * a : a))
    const seat = (m: T.Object3D, side: number, t: number, al: number, lift: number, lean = tilt) => {
      const across = b.roof === 'mono' || b.roof === 'flat' ? t : side * t, sd = b.roof === 'mono' || b.roof === 'flat' ? 1 : side
      const lx = r.along ? al : across, lz = r.along ? across : al
      m.position.set(lx, h + roofAt(b, r, cx + lx, cz + lz) + lift, lz)
      if (r.along) m.rotation.x = sd * lean; else m.rotation.z = -sd * lean
      rg.add(m)
    }
    const slab = (runLen: number, downLen: number, thick: number, mat: T.Material) => {
      const geo = keep(new THREE.BoxGeometry(r.along ? runLen : downLen, thick, r.along ? downLen : runLen)), grp = new THREE.Group()
      const m = new THREE.Mesh(geo, mat); m.castShadow = true
      grp.add(m, edges(geo, line)); return grp
    }
    const sl = slopes(d, b)
    if (sl.solar) {
      const arr = solarArray(d, b), mat = keep(new THREE.MeshStandardMaterial({ color: P.panel, roughness: 0.35, metalness: 0.3, clipShadows: true }))
      const lean = b.roof === 'flat' ? 0.2 : tilt, down = 1.75 * Math.cos(lean)
      const mid = b.roof === 'flat' ? 0 : b.roof === 'mono' ? (sl.shared ? a * 0.3 : 0) : a * (sl.shared ? 0.66 : 0.52)
      for (let row = 0; row < arr.rows; row++) for (let c = 0; c < arr.cols; c++) {
        const t = mid + (row - (arr.rows - 1) / 2) * (b.roof === 'flat' ? 2.3 : down + 0.06)
        seat(slab(1.05, 1.75, 0.05, mat), sl.solar, t, (c - (arr.cols - 1) / 2) * 1.15, b.roof === 'flat' ? 0.32 : 0.07, lean)
      }
    }
    if (sl.rooflights) {
      const t = b.roof === 'flat' ? (sl.shared ? -r.span * 0.3 : 0) : b.roof === 'mono' ? (sl.shared ? -a * 0.55 : 0) : a * (sl.shared ? 0.2 : 0.48)
      for (const k of [-0.28, 0, 0.28]) seat(slab(0.8, 1.15, b.roof === 'flat' ? 0.3 : 0.1, glass), sl.rooflights, t, k * r.run, b.roof === 'flat' ? 0.1 : 0.04)
    }
    if (sl.dormer) {
      const dm = dormerOf(d, b), face = -(r.span / 2 - dm.setback), mid = face + dm.back / 2, y = h + dm.top - dm.faceH / 2
      if (r.along) { box(rg, dm.width, dm.faceH, dm.back, plain, 0, y, mid); const p = new THREE.Group(); rg.add(p); p.position.set(0, 0, face + b.d / 2); pane(p, 'b', 0, h + dm.top - dm.faceH + 0.3, dm.width - 0.9, dm.faceH - 0.55, glass, 3) }
      else { box(rg, dm.back, dm.faceH, dm.width, plain, mid, y, 0); const p = new THREE.Group(); rg.add(p); p.position.set(face + b.w / 2, 0, 0); pane(p, 'l', 0, h + dm.top - dm.faceH + 0.3, dm.width - 0.9, dm.faceH - 0.55, glass, 3) }
    }
    if (has('chimney')) {
      const al = r.run / 2 - 1.3, top = r.rise + 0.75, lx = r.along ? al : 0.7, lz = r.along ? 0.7 : al
      box(rg, 0.62, top, 0.62, plain, lx, h + top / 2, lz); box(rg, 0.74, 0.1, 0.74, plain, lx, h + top + 0.05, lz)
    }
    if (has('terrace')) {
      const w = b.w - 0.5, dp = b.d - 0.5, y = h + 0.3
      const deck = canvasTex(128, (c) => { c.fillStyle = look.mode === 'model' ? '#EEE6D8' : tone; c.fillRect(0, 0, 128, 128); c.strokeStyle = HATCH[look.mode].timber; c.lineWidth = 1.5; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, i * 16 + 1); c.lineTo(128, i * 16 + 1); c.stroke() } })
      deck.repeat.set(w / 1.2, dp / 1.2)
      const dk = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, dp)), matt('#FFFFFF', { map: deck })); dk.rotation.x = -Math.PI / 2; dk.position.y = y + 0.012; dk.receiveShadow = true; rg.add(dk)
      for (const [gw, gd, x, z] of [[w, 0.03, 0, dp / 2], [w, 0.03, 0, -dp / 2], [0.03, dp, w / 2, 0], [0.03, dp, -w / 2, 0]]) box(rg, gw, 1.1, gd, clear, x, y + 0.55, z, false)
    }
  }

  // a dimension line: witness ticks at each end and the length written beside it
  function dimension(g: T.Group, a: [number, number, number], b: [number, number, number], text: string, color: string = P.text, h = 1.05) {
    const up = Math.abs(b[1] - a[1]) > 0.1, t = 0.4
    const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz) || 1
    const nx = up ? 0.7 : -dz / len, nz = up ? 0.7 : dx / len
    const mat = ink(0.95, color)
    g.add(segs([...a, ...b, a[0] - nx * t, a[1], a[2] - nz * t, a[0] + nx * t, a[1], a[2] + nz * t, b[0] - nx * t, b[1], b[2] - nz * t, b[0] + nx * t, b[1], b[2] + nz * t], mat))
    const s = label(text, h + 0.25, color)
    const off = up ? 0 : 1.25, sx = nx * off, sz = nz * off, out = Math.sign(sx * ((a[0] + b[0]) / 2) + sz * ((a[2] + b[2]) / 2)) || 1
    s.position.set((a[0] + b[0]) / 2 + sx * out + (up ? 2.6 : 0), (a[1] + b[1]) / 2 + (up ? 0.4 : 0.5), (a[2] + b[2]) / 2 + sz * out)
    g.add(s)
  }

  function extent(d: Design) {
    const bs = d.blocks.filter((b) => b.role !== 'garden' && b.role !== 'garage')
    const x0 = Math.min(...bs.map((b) => b.x)), x1 = Math.max(...bs.map((b) => b.x + b.w)), z0 = Math.min(...bs.map((b) => b.z)), z1 = Math.max(...bs.map((b) => b.z + b.d))
    return { x0, x1, z0, z1, top: Math.max(...bs.map((b) => roofOf(d.blocks, b).top)), levels: Math.max(...bs.map((b) => b.storeys)), basement: bs.some((b) => b.basement) }
  }

  function build(d: Design, assemble: boolean) {
    if (root) scene.remove(root)
    junk.splice(0).forEach((x) => x.dispose())
    sprites.length = 0; lifts = []; rises = []; caps = null
    P = PAL[look.mode]; CLAD = makeClad(look.mode)
    paper.set(P.bg)
    edgeMat.uniforms.ink.value.set(P.ink); edgeMat.uniforms.strength.value = P.edge
    const g = new THREE.Group()
    const all = extent(d)
    const back = d.type === 'extension'          // an extension is read from the garden, so its marks sit on that side
    const fz = back ? Math.min(...d.blocks.map((b) => b.z)) - 1.7 : Math.max(...d.blocks.map((b) => b.z + b.d)) + 1.7, fx = Math.max(all.x1, ...d.blocks.filter((b) => b.role === 'existing').map((b) => b.x + b.w)) + 1.7
    buildSite(g, d, look.mode, Math.min(PLOT.x1 - 2.8, fx + 2.2), back ? Math.max(PLOT.z0 + 3.4, fz - 3.6) : Math.min(PLOT.z1 - 3.4, fz + 3.6), back ? -1 : 1)
    const ctx = (id: string, x: number, z: number, w: number, dp: number): Block => ({ id, x, z, w, d: dp, storeys: 2, roof: 'gable', role: 'main', basement: false })
    for (const c of [ctx('n1', -29.5, -3, 9, 8), ctx('n2', 21.5, -4.5, 8, 9)]) volume(g, { ...d, blocks: [c], features: [] }, c, 'context', -1)
    d.blocks.forEach((b, i) => volume(g, d, b, b.role === 'existing' ? 'existing' : 'new', b.role === 'existing' ? -1 : i))

    // contact shadow: a soft dark band where walls meet the board, drawn once per build
    if (look.mode !== 'blueprint') {
      const k = 16, w = (PLOT.x1 - PLOT.x0) * k, hh = (PLOT.z1 - PLOT.z0) * k
      const cv = document.createElement('canvas'); cv.width = w; cv.height = hh
      const c = cv.getContext('2d')!
      for (let i = 9; i >= 1; i--) { c.fillStyle = `rgba(20,22,28,${look.mode === 'evening' ? 0.03 : 0.022})`; for (const b of d.blocks) c.fillRect((b.x - PLOT.x0) * k - i * 2.2, (b.z - PLOT.z0) * k - i * 2.2, b.w * k + i * 4.4, b.d * k + i * 4.4) }
      const map = keep(new THREE.CanvasTexture(cv)); map.colorSpace = THREE.SRGBColorSpace
      contact = new THREE.Mesh(keep(new THREE.PlaneGeometry(PLOT.x1 - PLOT.x0, PLOT.z1 - PLOT.z0)), flatMat('#FFFFFF', { map, transparent: true, depthWrite: false }))
      contact.rotation.x = -Math.PI / 2; contact.position.set((PLOT.x0 + PLOT.x1) / 2, 0.018, (PLOT.z0 + PLOT.z1) / 2); note(contact); contact.renderOrder = -1
      g.add(contact)
    } else contact = null

    // evening: warm light spilling from the new rooms onto the garden
    if (look.mode === 'evening') {
      for (const b of d.blocks.filter((x) => x.role !== 'existing').slice(0, 4)) {
        const pl = new THREE.PointLight('#FFB868', 70, 12, 1.7); pl.position.set(b.x + b.w / 2, 1.3, b.z - 1.1); g.add(pl)
      }
    }

    // ground dimensions for the new work, then anything the planning guide wants marked in red
    const e = extent({ ...d, blocks: d.blocks.filter((b) => b.role !== 'existing').length ? d.blocks.filter((b) => b.role !== 'existing') : d.blocks })
    const dims = new THREE.Group(); groundNotes!.add(dims)
    dimension(dims, [e.x0, 0.04, fz], [e.x1, 0.04, fz], `${(e.x1 - e.x0).toFixed(1)} m`)
    dimension(dims, [fx, 0.04, e.z0], [fx, 0.04, e.z1], `${(e.z1 - e.z0).toFixed(1)} m`)
    for (const m of look.marks) {
      const up = Math.abs(m.b[1] - m.a[1]) > 0.1
      if (up) g.add(markGroup(m)); else dimension(dims, m.a, m.b, m.text, P.red, 1.15)
    }
    const sel = d.blocks.find((b) => b.id === look.selected)
    if (sel) {
      const p = 0.18, y = 0.05, x0 = sel.x - p, x1 = sel.x + sel.w + p, z0 = sel.z - p, z1 = sel.z + sel.d + p
      dims.add(segs([x0, y, z0, x1, y, z0, x1, y, z0, x1, y, z1, x1, y, z1, x0, y, z1, x0, y, z1, x0, y, z0], ink(1, P.red)))
    }
    // level names beside the stack, shown when the model is pulled apart
    levelNotes = new THREE.Group(); g.add(levelNotes)
    const names: [number, string][] = [...(all.basement ? [[-1, 'B1'] as [number, string]] : []), ...Array.from({ length: all.levels }, (_, i) => [i, `0${i}`] as [number, string]), [all.levels, 'RF']]
    for (const [i, name] of names) { const s = label(name, 1.7, P.red); s.position.set(all.x0 - 3.4, i * 2.7 + 1.35, back ? all.z0 - 1.5 : all.z1 + 1.5); s.userData.i = i; levelNotes.add(s) }

    root = g; scene.add(g)
    const now = performance.now()
    if (assemble && !still) rises.forEach((r) => { r.t0 += now; r.o.scale.y = 0.001 }); else rises = []
    applyLight(); applyExplode(); applySection(); fitNotes()
    dirty = true
  }
  function markGroup(m: Mark) { const g = new THREE.Group(); dimension(g, m.a, m.b, m.text, P.red, 1.15); return g }

  function applyLight() {
    const mode = look.mode
    if (mode === 'blueprint') { hemi.intensity = 0; sunLight.intensity = 0; flat.intensity = 3.1; sunLight.castShadow = false; return }
    flat.intensity = 0; sunLight.castShadow = true
    if (mode === 'evening') {
      hemi.color.set('#8E9FC8'); hemi.groundColor.set('#2A3244'); hemi.intensity = 1.5
      sunLight.color.set('#B4C4EC'); sunLight.intensity = 0.9; sunLight.position.set(-34, 40, 46)
      return
    }
    const s = sunVector(design.facing, look.day, look.hour), up = s.alt <= 0 ? 0 : Math.min(1, 0.55 + s.alt / 26)
    hemi.color.set('#FFFFFF'); hemi.groundColor.set('#F1EFEA'); hemi.intensity = 1.72 + 0.4 * up
    sunLight.color.set('#FFFFFF'); sunLight.intensity = 1.5 * up
    sunLight.position.set(s.x * 80, Math.max(0.05, s.y) * 80, s.z * 80)
  }

  function applyExplode() {
    const e = look.explode
    for (const l of lifts) l.o.position.y = l.i * GAP * e
    if (boardMat) { boardMat.transparent = e > 0; boardMat.opacity = 1 - 0.86 * e; boardMat.depthWrite = e === 0 }
    if (contact) contact.visible = e === 0 && look.section === null
    if (levelNotes) { levelNotes.visible = e > 0.05; levelNotes.children.forEach((s) => { s.position.y = (s.userData.i as number) * (2.7 + GAP * e) + 1.35 }) }
  }

  // ---- section: everything nearer the road than the cut is clipped away, and the cut face is drawn as a true section
  function applySection() {
    if (caps && root) { root.remove(caps); caps = null }
    const on = look.section !== null && root
    renderer.clippingPlanes = on ? [clip] : []
    if (board) { board.scale.y = on ? 3.6 : 1; board.position.y = on ? -1.8 : -0.5 }
    if (contact) contact.visible = look.explode === 0 && !on
    if (!on || !root) return
    const d = design, e = extent(d)
    const z0 = e.z0, z1 = e.z1                       // the cut travels through the house, not the outbuildings
    // a new home is cut from the road side, an extension from the garden side, so the cut always faces the usual view
    const f = d.type === 'extension' ? -1 : 1, t = (look.section as number) * (z1 - z0 + 0.4)
    const c = f > 0 ? z1 + 0.4 - t : z0 - 0.4 + t
    clip.normal.set(0, 0, -f); clip.constant = f * c
    const g = new THREE.Group(); caps = g; root.add(g)
    const poche = flatMat(look.mode === 'blueprint' ? '#EAF2FA' : look.mode === 'evening' ? '#0B0E13' : P.ink, { side: THREE.DoubleSide })
    const earth = flatMat(P.earth, { side: THREE.DoubleSide })
    const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(72, 3.6)), earth); ground.position.set(0, -1.8, c - f * 0.05); g.add(ground)
    const hatch: number[] = []
    for (let x = -36; x < 36; x += 0.9) hatch.push(x, -0.02, c - f * 0.04, x + 0.55, -0.6, c - f * 0.04)
    g.add(segs([-36, 0, c - f * 0.04, 36, 0, c - f * 0.04, ...hatch], ink(0.6)))
    const ctx: Block[] = [{ id: 'n1', x: -29.5, z: -3, w: 9, d: 8, storeys: 2, roof: 'gable', role: 'main', basement: false }, { id: 'n2', x: 21.5, z: -4.5, w: 8, d: 9, storeys: 2, roof: 'gable', role: 'main', basement: false }]
    for (const b of [...d.blocks, ...ctx]) {
      if (c <= b.z + 0.02 || c >= b.z + b.d - 0.02) continue
      const own = d.blocks.includes(b), r = roofOf(own ? d.blocks : [b], b), sh = storeyH(b), wall = 0.3
      const shape = new THREE.Shape(), base = b.basement ? -sh : 0
      shape.moveTo(b.x, base); shape.lineTo(b.x + b.w, base); shape.lineTo(b.x + b.w, r.eave); shape.lineTo(b.x + b.w + OVERHANG, r.eave)
      const xs: number[] = []
      for (let x = b.x + b.w + OVERHANG; x >= b.x - OVERHANG - 1e-6; x -= 0.125) xs.push(x)
      for (const x of xs) shape.lineTo(x, r.eave + roofAt(b, r, Math.min(b.x + b.w + OVERHANG - 1e-3, Math.max(b.x - OVERHANG + 1e-3, x)), c))
      shape.lineTo(b.x - OVERHANG, r.eave); shape.lineTo(b.x, r.eave); shape.closePath()
      if (own) {
        // rooms and the roof void are holes in the cut, so the inside of the model shows through
        const hole = (pts: [number, number][]) => { if (pts.length > 2) shape.holes.push(new THREE.Path(pts.map(([x, y]) => new THREE.Vector2(x, y)))) }
        for (let s = b.basement ? -1 : 0; s < b.storeys; s++) { const y0 = s * sh + (s < 0 ? 0.3 : 0.22), y1 = (s + 1) * sh - (s < 0 ? 0.3 : 0.06); hole([[b.x + wall, y0], [b.x + b.w - wall, y0], [b.x + b.w - wall, y1], [b.x + wall, y1]]) }
        if (b.roof !== 'flat') {
          const top = xs.map((x) => [x, roofAt(b, r, x, c) - 0.28] as [number, number]).filter(([x, y]) => y > 0.3 && x > b.x + wall && x < b.x + b.w - wall)
          if (top.length > 2) hole([[top[0][0], r.eave + 0.16], ...top.map(([x, y]) => [x, r.eave + y] as [number, number]), [top[top.length - 1][0], r.eave + 0.16]])
        }
      }
      const m = new THREE.Mesh(keep(new THREE.ShapeGeometry(shape)), own ? poche : flatMat(P.context, { side: THREE.DoubleSide })); m.position.z = c - f * 0.03; g.add(m)
    }
    // level datum lines either side of the cut
    const pts: number[] = []
    for (let s = 0; s <= e.levels; s++) pts.push(e.x0 - 3, s * 2.7, c - f * 0.01, e.x0 - 0.8, s * 2.7, c - f * 0.01)
    g.add(segs(pts, ink(0.9, P.red)))
    dirty = true
  }

  // lettering is enlarged on the plan, which shows far more ground, and ground marks are hidden in elevation where they would sit edge on
  function fitNotes() {
    const v = look.view, k = v === 'plan' ? 1.75 : v === 'axo' ? 1 : 0.9
    for (const s of sprites) s.scale.set((s.userData.h as number) * 5 * k, (s.userData.h as number) * k, 1)
    if (groundNotes) groundNotes.visible = v === 'axo' || v === 'plan'
  }

  let size = { w: 0, h: 0 }
  const frame = (w = host.clientWidth, h = host.clientHeight, ratio = 2) => {
    if (!w || !h) return
    size = { w, h }
    renderer.setPixelRatio(ratio); renderer.setSize(w, h, false)
    dataRT.setSize(w * ratio, h * ratio)
    edgeMat.uniforms.px.value.set(1 / (w * ratio), 1 / (h * ratio))
    const k = w / h, hh = k < 1.25 ? half * (1.25 / k) * 0.92 : half        // a narrow screen keeps the whole model in view
    Object.assign(cam, { left: -hh * k, right: hh * k, top: hh, bottom: -hh }); cam.updateProjectionMatrix()
    dirty = true
  }

  const place = (v: ViewName) => {
    const e = extent(design), mx = (e.x0 + e.x1) / 2, mz = (e.z0 + e.z1) / 2
    const lift = look.explode * GAP * e.levels
    cam.zoom = 1; controls.enabled = v === 'axo'; cam.up.set(0, 1, 0)
    const elevH = Math.max(8.5, (e.top + lift) / 2 + 3.2), ey = Math.max(4.6, (e.top + lift) / 2 + 0.4) - (look.section !== null ? 1 : 0)
    if (v === 'axo') {
      const ty = 2.2 + lift * 0.42 - (look.section !== null || look.explode > 0 ? 0.8 : 0)
      half = Math.max(13, Math.max(e.x1 - e.x0, e.z1 - e.z0) * 0.5 + 6.5) + lift * 0.5
      controls.target.set(mx * 0.6, ty, mz * 0.6)
      cam.position.set(controls.target.x + AXO[0] * DIST, ty + AXO[1] * DIST, controls.target.z + AXO[2] * DIST * (design.type === 'extension' ? -1 : 1))
    } else if (v === 'plan') {
      half = 24.5; cam.up.set(0, 0, -1); cam.position.set(0, DIST, 2.5); controls.target.set(0, 0, 2.5)
    } else {
      half = elevH
      const dir = v === 'front' ? [0, 1] : v === 'rear' ? [0, -1] : v === 'right' ? [1, 0] : [-1, 0]
      controls.target.set(dir[0] ? 0 : mx, ey, dir[1] ? 0 : mz)
      cam.position.set(controls.target.x + dir[0] * DIST, ey, controls.target.z + dir[1] * DIST)
    }
    cam.lookAt(controls.target); controls.update()
    fitNotes(); frame(size.w || undefined, size.h || undefined)
  }

  function render() {
    // the scene has no background of its own: three clears the whole frame whenever one is set, which would wipe earlier passes
    renderer.setRenderTarget(null); renderer.setClearColor(paper, 1); renderer.clear()
    cam.layers.set(0); renderer.render(scene, cam)
    // outline data
    scene.overrideMaterial = dataMat
    renderer.setRenderTarget(dataRT); renderer.setClearColor(blank, 1); renderer.clear()
    const shadows = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false
    renderer.render(scene, cam)
    renderer.shadowMap.autoUpdate = shadows
    scene.overrideMaterial = null
    renderer.setRenderTarget(null)
    const planes = renderer.clippingPlanes; renderer.clippingPlanes = []
    renderer.render(quadScene, quadCam)
    renderer.clippingPlanes = planes
    cam.layers.set(1); renderer.render(scene, cam)
    cam.layers.set(0)
  }

  const ro = new ResizeObserver(() => frame()); ro.observe(host)
  build(first, true); frame(); place(look.view)
  let raf = 0
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    if (controls.enabled) controls.update()
    if (rises.length) {
      rises = rises.filter((r) => { const t = Math.min(1, Math.max(0, (now - r.t0) / 520)); r.o.scale.y = Math.max(0.001, 1 - Math.pow(1 - t, 3)); return t < 1 })
      dirty = true
    }
    if (dirty) { dirty = false; render() }
  }
  raf = requestAnimationFrame(loop)

  const sig = (d: Design, l: Look) => JSON.stringify([d, l.mode, l.selected, l.marks, l.section !== null])
  let last = sig(first, look)

  function set(d: Design, l: Look, assemble = false) {
    const prev = look, s = sig(d, l), changed = s !== last
    design = d; look = l
    if (changed || assemble) { last = s; build(d, assemble) }
    else {
      if (prev.day !== l.day || prev.hour !== l.hour) applyLight()
      if (prev.explode !== l.explode) applyExplode()
      if (prev.section !== l.section) { applySection(); applyExplode() }
    }
    if (prev.view !== l.view || (prev.section === null) !== (l.section === null) || (prev.explode > 0) !== (l.explode > 0) || (l.view !== 'axo' && changed)) place(l.view)
    dirty = true
  }

  return {
    set,
    shots: (d) => {
      const was = look, pos = cam.position.clone(), tgt = controls.target.clone(), zoom = cam.zoom, host2 = { ...size }
      const base: Look = { view: 'axo', mode: 'model', section: null, explode: 0, day: 172, hour: 14.5, marks: [], selected: null }
      rises.splice(0).forEach((r) => { r.o.scale.y = 1 })
      const take = (name: string, patch: Partial<Look>, w = 1400, h = 875, q = 0.88): Shot => {
        const l = { ...base, ...patch }
        size = { w, h }; set(d, l); place(l.view); frame(w, h, 1)
        render()
        return { label: name, src: renderer.domElement.toDataURL('image/jpeg', q) }
      }
      const out: Shots = {
        hero: take('Concept model', {}),
        plan: take('Site plan', { view: 'plan', day: 80, hour: 13 }),
        elevations: ([['front', 'Front elevation'], ['rear', 'Rear elevation'], ['left', 'Side elevation, left'], ['right', 'Side elevation, right']] as [ViewName, string][]).map(([view, name]) => take(name, { view }, 1200, 620)),
        section: take('Section A-A', { view: d.type === 'extension' ? 'rear' : 'front', section: d.type === 'extension' ? 0.25 : 0.5 }, 1200, 620),
        exploded: take('Exploded axonometric', { explode: 1 }),
        sun: [80, 172, 355].flatMap((day) => [9, 12, 15].map((hour) => take(`${day === 80 ? '21 March' : day === 172 ? '21 June' : '21 December'}, ${hour}:00`, { view: 'plan', day, hour }, 640, 520, 0.8))),
        evening: take('Evening view', { mode: 'evening' }),
      }
      // back to whatever the customer was looking at
      size = host2; set(d, was); place(was.view)
      if (was.view === 'axo') { cam.position.copy(pos); controls.target.copy(tgt); cam.zoom = zoom; cam.updateProjectionMatrix(); controls.update() }
      frame(host.clientWidth || host2.w, host.clientHeight || host2.h)
      return out
    },
    dispose: () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose()
      junk.splice(0).forEach((x) => x.dispose())
      dataRT.dispose(); dataMat.dispose(); edgeMat.dispose(); quad.geometry.dispose()
      renderer.dispose(); renderer.domElement.remove()
    },
  }
}

export default forwardRef<ViewHandle, { design: Design; look: Look; assemble: number; children?: React.ReactNode }>(function View3D({ design, look, assemble, children }, ref) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  const latest = useRef({ design, look })
  const built = useRef(assemble)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  latest.current = { design, look }

  useEffect(() => {
    let dead = false
    create(host.current!, latest.current.design, latest.current.look).then((a) => {
      if (dead) { a.dispose(); return }
      api.current = a; setReady(true)
    }).catch(() => setFailed(true))
    return () => { dead = true; api.current?.dispose(); api.current = null }
  }, [])

  useEffect(() => {
    const again = built.current !== assemble
    built.current = assemble
    api.current?.set(design, look, again)
  }, [design, look, assemble, ready])
  useImperativeHandle(ref, () => ({ shots: () => api.current?.shots(latest.current.design) ?? null }), [])

  return (
    <div className="hf-view" ref={host} data-view={look.view} data-mode={look.mode}>
      {failed ? <p className="small" style={{ padding: 16 }}>This browser cannot show 3D. The rest of the walk-through still works.</p> : null}
      {!ready && !failed ? <span className="hf-view-wait">Setting out the model</span> : null}
      {ready ? children : null}
    </div>
  )
})
