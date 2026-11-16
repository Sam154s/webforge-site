'use client'
// The ink model: the planned room as an axonometric, built from the same scene as the plan. Orthographic camera,
// clean boxes in the chosen finishes, ink edges, one soft shadow. Drag to turn it; the explode slider lifts the
// worktops, wall units and roof items apart so the customer can see how the room goes together.
// three.js is loaded only here, on the client, when the sheet is opened.
import { useEffect, useRef, useState } from 'react'
import type * as T from 'three'
import { WALL_OF, WALL_T, box, def, dims, mat, type Placed, type Scene } from '@/lib/sandbox/builder'
import { mix } from './draw'

type Api = { build: (s: Scene) => void; explode: (t: number) => void; dispose: () => void }
const INK = '#1B2430', CARD = '#FBF8F1', CER = '#FCFBF7', STEEL = '#CFD2CF', GLASS = '#B9CBD3'

async function create(host: HTMLDivElement, first: Scene): Promise<Api> {
  const THREE = await import('three')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  host.prepend(renderer.domElement)

  const scene = new THREE.Scene()
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const place = (az: number) => cam.position.set(Math.sin(az) * 30 * Math.sin(0.92), 30 * Math.cos(0.92) + 1, Math.cos(az) * 30 * Math.sin(0.92))
  place(calm ? 0.62 : 0.2)
  const controls = new OrbitControls(cam, renderer.domElement)
  controls.target.set(0, 1, 0); controls.enableZoom = false; controls.enablePan = false; controls.enableDamping = true; controls.rotateSpeed = 0.6
  controls.minPolarAngle = 0.45; controls.maxPolarAngle = 1.25
  controls.update()

  scene.add(new THREE.HemisphereLight('#FFFFFF', '#EFE9DC', 1.9))
  const sun = new THREE.DirectionalLight('#FFFFFF', 1.35)
  sun.position.set(-6, 14, 5); sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 5
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 })
  scene.add(sun, sun.target)

  const junk: { dispose: () => void }[] = []
  const keep = <X extends { dispose: () => void }>(x: X) => { junk.push(x); return x }
  const lineMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.85 })
  const softLine = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.4 })
  const leadMat = new THREE.LineDashedMaterial({ color: '#B4472E', dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.8 })

  let root: T.Group | null = null
  let walls: { g: T.Object3D; nx: number; nz: number }[] = []
  let lifts: { g: T.Group; k: number; leads: T.Line[] }[] = []
  let half = 4, tall = 2.6, lift = 0

  function build(s: Scene) {
    if (root) scene.remove(root)
    junk.splice(0).forEach((x) => x.dispose())
    root = new THREE.Group(); walls = []; lifts = []
    const L = s.length / 1000, W = s.width / 1000, H = s.height / 1000, TH = WALL_T / 1000
    const M = (id: string) => mat(id).hex
    const paint = mix(M(s.mats.walls), '#FFFFFF', 0.25), top = M(s.mats.worktop), front = M(s.mats.fronts), metal = s.job === 'extension' ? M(s.mats.metal) : M(s.mats.metal)
    const solid = (c: string, o: Partial<T.MeshStandardMaterialParameters> = {}) => keep(new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, metalness: 0, ...o }))
    const groups = { base: new THREE.Group(), top: new THREE.Group(), high: new THREE.Group(), ceil: new THREE.Group() }
    // a box with ink edges. x, z are the plan position of its near corner in metres; y is its base height.
    const slab = (g: T.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, c: string, o: { glass?: boolean; soft?: boolean; shadow?: boolean } = {}) => {
      const geo = keep(new THREE.BoxGeometry(w, h, d))
      const mesh = new THREE.Mesh(geo, o.glass ? solid(c, { transparent: true, opacity: 0.28, roughness: 0.2, depthWrite: false }) : solid(c))
      mesh.position.set(x + w / 2 - L / 2, y + h / 2, z + d / 2 - W / 2)
      mesh.castShadow = !o.glass && o.shadow !== false; mesh.receiveShadow = !o.glass
      const e = new THREE.LineSegments(keep(new THREE.EdgesGeometry(geo)), o.soft ? softLine : lineMat); e.position.copy(mesh.position)
      g.add(mesh, e)
      return mesh
    }
    // floor and the four walls. A wall between the camera and the room is hidden as the model turns.
    slab(groups.base, -TH, -0.09, -TH, L + 2 * TH, 0.09, W + 2 * TH, mix(M(s.mats.floor), '#FFFFFF', 0.12), { shadow: false })
    const wallDefs: [string, number, number, number, number, number, number][] = [['N', -TH, -TH, L + 2 * TH, TH, 0, -1], ['S', -TH, W, L + 2 * TH, TH, 0, 1], ['W', -TH, 0, TH, W, -1, 0], ['E', L, 0, TH, W, 1, 0]]
    for (const [name, x, z, w, d, nx, nz] of wallDefs) {
      const g = new THREE.Group()
      slab(g, x, 0, z, w, H, d, name === 'N' && s.job === 'extension' ? '#E4DDCD' : paint, { shadow: false })
      for (const p of s.items) {
        const dd = def(p.kind); if (dd.mount !== 'opening' || WALL_OF[p.rot] !== name) continue
        const b = box(p), ow = dims(p)[0] / 1000, oh = dd.h / 1000, oz = dd.z / 1000, c = dd.glazed || p.kind === 'window' ? GLASS : p.kind === 'knock' ? '#CFC7B6' : '#EFE8D9'
        const t = 0.03
        if (name === 'N') slab(g, b.x / 1000, oz, -t / 2, ow, oh, t, c, { shadow: false })
        if (name === 'S') slab(g, b.x / 1000, oz, W - t / 2, ow, oh, t, c, { shadow: false })
        if (name === 'W') slab(g, -t / 2, oz, b.y / 1000, t, oh, ow, c, { shadow: false })
        if (name === 'E') slab(g, L - t / 2, oz, b.y / 1000, t, oh, ow, c, { shadow: false })
        if (dd.glazed && p.kind !== 'xwindow') {   // frames in the chosen colour
          const fr = 0.05, along = name === 'N' || name === 'S'
          const bar = (a: number, y: number, len: number, hh: number) => along ? slab(g, b.x / 1000 + a, oz + y, (name === 'N' ? 0 : W) - 0.03, len, hh, 0.06, metal, { shadow: false }) : slab(g, (name === 'W' ? 0 : L) - 0.03, oz + y, b.y / 1000 + a, 0.06, hh, len, metal, { shadow: false })
          bar(0, oh - fr, ow, fr); const n = Math.max(2, Math.round(ow / 0.9))
          for (let i = 0; i <= n; i++) bar(Math.min(ow - fr, (i * ow) / n), 0, fr, oh)
        }
      }
      walls.push({ g, nx, nz }); groups.base.add(g)
    }
    const lead = (g: T.Group, x: number, y: number, z: number) => {
      const geo = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0)]))
      const l = new THREE.Line(geo, leadMat); l.computeLineDistances(); l.position.set(x - L / 2, y, z - W / 2); l.scale.y = 0.0001; l.visible = false
      g.add(l); return l
    }
    const leads: Record<'top' | 'high' | 'ceil', T.Line[]> = { top: [], high: [], ceil: [] }
    for (const p of s.items as Placed[]) {
      const d = def(p.kind); if (d.mount === 'opening' || d.mount === 'ground') continue
      const b = box(p), x = b.x / 1000, z = b.y / 1000, w = b.w / 1000, dp = b.h / 1000, h = d.h / 1000, y = d.z / 1000
      const cx = x + w / 2, cz = z + dp / 2
      if (d.mount === 'ceiling') {
        const tall = p.kind === 'lantern' ? 0.4 : p.kind === 'fan' ? 0.05 : 0.12
        slab(groups.ceil, x, H, z, w, tall, dp, p.kind === 'fan' ? CER : '#DCE8EC', { glass: p.kind !== 'fan' })
        leads.ceil.push(lead(groups.ceil, cx, H, cz)); continue
      }
      if (d.mount === 'high') {
        slab(groups.high, x, y, z, w, h, dp, p.kind === 'hood' ? STEEL : p.kind === 'towel' ? metal : p.kind === 'mirror' ? '#DCE6EA' : p.kind === 'niche' ? '#D9D2C2' : front)
        leads.high.push(lead(groups.high, cx, y, cz)); continue
      }
      const body = d.front ? front : ['fridge', 'range'].includes(p.kind) ? STEEL : d.water && d.group === 'Sanitaryware' ? CER : p.kind === 'burner' ? '#3C4146' : p.kind === 'table' || p.kind === 'sofa' || p.kind === 'bar' ? '#E9E0CC' : CARD
      if (p.kind === 'tray' || p.kind === 'walkin') { slab(groups.base, x, 0, z, w, 0.04, dp, CER); slab(groups.base, x, 0.04, z, w, h - 0.04, dp, GLASS, { glass: true }); continue }
      if (p.kind === 'utility' || p.kind === 'cloak' || p.kind === 'stud') { slab(groups.base, x, 0, z, w, h, dp, paint, { soft: true }); continue }
      if (p.kind === 'burner') { slab(groups.base, x, 0, z, w, 0.04, dp, '#B9B2A2', { shadow: false }); slab(groups.base, cx - 0.26, 0.04, cz - 0.2, 0.52, 0.62, 0.4, body); slab(groups.base, cx - 0.06, 0.66, cz - 0.06, 0.12, H - 0.66, 0.12, body); continue }
      if (p.kind === 'table') { slab(groups.base, x, 0.71, z, w, 0.04, dp, body); for (const [lx, lz] of [[x + 0.05, z + 0.05], [x + w - 0.11, z + 0.05], [x + 0.05, z + dp - 0.11], [x + w - 0.11, z + dp - 0.11]]) slab(groups.base, lx, 0, lz, 0.06, 0.71, 0.06, body, { soft: true }); continue }
      if (p.kind === 'sofa') { slab(groups.base, x, 0, z, w, 0.42, dp, body); const back = p.rot === 0 ? [x, z, w, 0.22] : p.rot === 180 ? [x, z + dp - 0.22, w, 0.22] : p.rot === 270 ? [x, z, 0.22, dp] : [x + w - 0.22, z, 0.22, dp]; slab(groups.base, back[0], 0.42, back[1], back[2], 0.38, back[3], body); continue }
      if (p.kind === 'bar') { slab(groups.base, x + 0.03, 0, z + 0.03, w - 0.06, h - 0.04, dp - 0.06, front, { soft: true }); slab(groups.top, x, h - 0.04, z, w, 0.04, dp, top); leads.top.push(lead(groups.top, cx, h - 0.04, cz)); continue }
      slab(groups.base, x, 0, z, w, h, dp, body)
      if (d.top) {
        slab(groups.top, x - 0.01, h, z - 0.01, w + 0.02, 0.04, dp + 0.02, top); leads.top.push(lead(groups.top, cx, h, cz))
        if (d.cooks) slab(groups.top, cx - Math.min(w, 0.9) / 2 + 0.04, h + 0.04, cz - 0.24, Math.min(w, 0.9) - 0.08, 0.012, 0.48, '#2A2C30', { shadow: false })
        if (p.kind === 'sink' || p.kind === 'krun') slab(groups.top, x + (p.rot % 180 === 0 ? w * 0.3 : w / 2 - 0.02), h + 0.04, z + (p.rot % 180 === 0 ? dp / 2 - 0.02 : dp * 0.3), 0.04, 0.3, 0.04, metal)
      }
      if (p.kind === 'bath' || p.kind === 'fsbath') slab(groups.base, x + 0.07, h - 0.02, z + 0.07, w - 0.14, 0.021, dp - 0.14, '#C9D6DB', { shadow: false })
      if (p.kind === 'vanity' || p.kind === 'basin') slab(groups.base, x - 0.01, h, z - 0.01, w + 0.02, 0.05, dp + 0.02, CER)
    }
    lifts = [{ g: groups.top, k: 0.5, leads: leads.top }, { g: groups.high, k: 0.95, leads: leads.high }, { g: groups.ceil, k: 1.5, leads: leads.ceil }]
    root.add(groups.base, groups.top, groups.high, groups.ceil)
    scene.add(root)
    half = Math.hypot(L, W) / 2 + 0.45; tall = (H * 0.8 + Math.hypot(L, W) * 0.62) / 2 + 0.3
    controls.target.set(0, H * 0.46, 0)
    explode(lift); frame()
  }

  function explode(t: number) {
    lift = t
    for (const l of lifts) { l.g.position.y = l.k * t; for (const ln of l.leads) { ln.visible = t > 0.02; ln.scale.y = Math.max(0.0001, l.k * t) } }
    frame()
  }
  function frame() {
    const w = host.clientWidth, h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    const hh = Math.max(half / (w / h), tall) + lift * 0.5   // wide enough for the room on the turn, tall enough for the walls
    Object.assign(cam, { left: -hh * (w / h), right: hh * (w / h), top: hh + lift * 0.55, bottom: -hh + lift * 0.55 }); cam.updateProjectionMatrix()
  }

  const ro = new ResizeObserver(frame); ro.observe(host)
  build(first)
  let raf = 0, t0 = performance.now(), intro = !calm
  renderer.domElement.addEventListener('pointerdown', () => { intro = false })
  const loop = (t: number) => {
    if (intro) { const k = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - k, 3); place(0.2 + 0.42 * e); if (k >= 1) intro = false }
    controls.update()
    const dx = cam.position.x - controls.target.x, dz = cam.position.z - controls.target.z, len = Math.hypot(dx, dz) || 1
    for (const wl of walls) wl.g.visible = (wl.nx * dx + wl.nz * dz) / len < 0.12
    renderer.render(scene, cam); raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  return {
    build, explode,
    dispose: () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose()
      junk.splice(0).forEach((x) => x.dispose())
      lineMat.dispose(); softLine.dispose(); leadMat.dispose(); renderer.dispose(); renderer.domElement.remove()
    },
  }
}

export default function Axo({ scene }: { scene: Scene }) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  const latest = useRef(scene); latest.current = scene
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [lift, setLift] = useState(0)

  useEffect(() => {
    let dead = false
    create(host.current!, latest.current).then((a) => { if (dead) { a.dispose(); return } api.current = a; setReady(true) }).catch(() => setFailed(true))
    return () => { dead = true; api.current?.dispose(); api.current = null }
  }, [])
  useEffect(() => { api.current?.build(scene) }, [scene, ready])
  useEffect(() => { api.current?.explode(lift / 100) }, [lift, ready])

  return (
    <div className="bb-axowrap">
      <div className="bb-axo" ref={host}>
        {failed ? <p className="small" style={{ padding: 16 }}>This browser cannot show the model. Every other sheet still works.</p> : null}
        {!failed ? <span className="hint">{ready ? 'Drag to turn the room' : 'Building the model'}</span> : null}
      </div>
      <label className="ctl"><span className="top-line"><span>Explode: lift the worktops, wall units and roof items apart</span><b>{lift}%</b></span>
        <input type="range" min={0} max={100} value={lift} onChange={(e) => setLift(+e.target.value)} aria-label="Explode the model" /></label>
    </div>
  )
}
