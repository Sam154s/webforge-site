// Building company demo: the room planner model. One Scene (room in mm, placed items, chosen materials) is the
// source of truth; the plan, elevations, quantities, prices, programme and regulations sheet all derive from it.
// Example catalogue, price book and design rules for a fictional firm. Plain code: same scene, same answers.

export type Job = 'kitchen' | 'bathroom' | 'extension'
export type Finish = 'good' | 'better' | 'best'
export type Wall = 'N' | 'E' | 'S' | 'W'
export type Rot = 0 | 90 | 180 | 270
export type Mount = 'wall' | 'floor' | 'high' | 'opening' | 'ceiling' | 'ground'
export type Pin = { x: number; y: number; label: string }   // x and y are 0 to 1 across the photo
export type Box = { x: number; y: number; w: number; h: number }
export type Seg = { x1: number; y1: number; x2: number; y2: number }

export const WALL_T = 150                 // wall thickness as drawn, mm
export const WALLS: Wall[] = ['N', 'E', 'S', 'W']
export const ROT: Record<Wall, Rot> = { N: 0, E: 90, S: 180, W: 270 }
export const WALL_OF: Record<Rot, Wall> = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }
export const WALL_NAME: Record<Wall, string> = { N: 'Wall A', E: 'Wall B', S: 'Wall C', W: 'Wall D' }

// ------------------------------------------------------------------------------------------ catalogue
export type Clear = { front?: number; side?: number; run?: number; around?: number; min?: number; swing?: boolean }
export type ItemDef = {
  kind: string; name: string; tag: string
  w: number; d: number; h: number; z: number      // width along the wall, depth out from it, height, height off the floor
  sizes?: [number, number][]                       // other widths and depths the customer can pick
  mount: Mount
  price: [number, number, number]                  // installed, good / better / best
  per?: 'm'                                        // priced per metre of width
  group: string                                    // the quote line it sits under
  top?: boolean; front?: boolean; tall?: boolean   // carries worktop; has cabinet fronts; full height
  free?: boolean                                   // layout only, never priced
  water?: 'waste' | 'soil'; elec?: boolean; cooks?: boolean; wet?: boolean; glazed?: boolean
  clear?: Clear
  walls?: Wall[]                                   // walls this item may sit on
}

const T = WALL_T
const it = (kind: string, name: string, tag: string, w: number, d: number, h: number, z: number, mount: Mount, price: [number, number, number], group: string, x: Partial<ItemDef> = {}): ItemDef =>
  ({ kind, name, tag, w, d, h, z, mount, price, group, ...x })
const widths = (...w: number[]): [number, number][] => w.map((v) => [v, T])
const OUT: Wall[] = ['S', 'E', 'W']

export const ITEMS: ItemDef[] = [
  // ---- kitchen
  it('base', 'Base unit', 'Base', 600, 600, 870, 0, 'wall', [380, 520, 690], 'Units', { top: true, front: true, sizes: [[600, 600], [400, 600], [800, 600], [1000, 600]] }),
  it('drawer', 'Drawer unit', 'Drawers', 800, 600, 870, 0, 'wall', [480, 640, 880], 'Units', { top: true, front: true, sizes: [[800, 600], [600, 600], [1000, 600]] }),
  it('wallu', 'Wall unit', 'Wall', 600, 330, 720, 1510, 'high', [230, 320, 440], 'Units', { front: true, sizes: [[600, 330], [400, 330], [800, 330], [1000, 330]] }),
  it('larder', 'Tall larder', 'Larder', 600, 600, 2150, 0, 'wall', [720, 1050, 1480], 'Units', { front: true, tall: true }),
  it('sink', 'Sink unit, sink and tap', 'Sink', 1000, 600, 870, 0, 'wall', [680, 980, 1380], 'Units', { top: true, front: true, water: 'waste', sizes: [[1000, 600], [800, 600]] }),
  it('hob', 'Induction hob', 'Hob', 600, 600, 870, 0, 'wall', [480, 860, 1550], 'Appliances', { top: true, front: true, elec: true, cooks: true, sizes: [[600, 600], [900, 600]] }),
  it('oven', 'Built-in oven tower', 'Oven', 600, 600, 2150, 0, 'wall', [920, 1400, 2150], 'Appliances', { front: true, tall: true, elec: true }),
  it('range', 'Range cooker', 'Range', 1000, 600, 900, 0, 'wall', [1850, 2900, 4400], 'Appliances', { elec: true, cooks: true, sizes: [[1000, 600], [900, 600], [1100, 600]] }),
  it('hood', 'Extractor hood', 'Hood', 600, 450, 570, 1660, 'high', [360, 640, 1150], 'Appliances', { elec: true, sizes: [[600, 450], [900, 450]] }),
  it('dw', 'Dishwasher', 'DW', 600, 600, 870, 0, 'wall', [560, 740, 980], 'Appliances', { top: true, front: true, water: 'waste', elec: true }),
  it('fridge', 'Fridge freezer', 'FF', 600, 650, 1800, 0, 'wall', [720, 1250, 2100], 'Appliances', { tall: true, elec: true, clear: { front: 800 }, sizes: [[600, 650], [915, 750]] }),
  it('island', 'Island', 'Island', 1800, 900, 870, 0, 'floor', [3100, 4800, 7600], 'Units', { top: true, front: true, clear: { around: 1000, min: 900 }, sizes: [[1800, 900], [2100, 900], [2400, 1200]] }),
  it('bar', 'Breakfast bar', 'Bar', 1500, 450, 910, 0, 'floor', [620, 950, 1450], 'Units', { top: true, sizes: [[1500, 450], [1800, 450]] }),
  it('boiler', 'Boiler housing', 'Boiler', 600, 350, 720, 1510, 'high', [260, 340, 460], 'Units', { front: true }),
  it('table', 'Dining table', 'Table', 1600, 900, 750, 0, 'floor', [0, 0, 0], 'Layout', { free: true, sizes: [[1600, 900], [1200, 800], [2000, 1000]] }),
  it('door', 'Door, as existing', 'Door', 838, T, 2040, 0, 'opening', [0, 0, 0], 'Layout', { free: true, clear: { swing: true }, sizes: widths(838, 762) }),
  it('window', 'Window, as existing', 'Window', 1200, T, 1050, 1050, 'opening', [0, 0, 0], 'Layout', { free: true, sizes: widths(1200, 600, 900, 1800) }),
  // ---- bathroom
  it('bath', 'Bath', 'Bath', 1700, 700, 540, 0, 'wall', [720, 1150, 1750], 'Sanitaryware', { water: 'waste', wet: true, clear: { front: 700, run: 700 }, sizes: [[1700, 700], [1500, 700], [1800, 800]] }),
  it('fsbath', 'Freestanding bath', 'Bath', 1700, 750, 580, 0, 'floor', [1650, 2600, 3900], 'Sanitaryware', { water: 'waste', wet: true, clear: { around: 100, min: 100 }, sizes: [[1700, 750], [1500, 720]] }),
  it('tray', 'Shower enclosure', 'Shower', 900, 900, 2000, 0, 'wall', [920, 1450, 2150], 'Sanitaryware', { water: 'waste', wet: true, clear: { front: 600, run: 600 }, sizes: [[900, 900], [1200, 800], [1400, 900]] }),
  it('walkin', 'Walk-in shower', 'Walk-in', 1400, 800, 2000, 0, 'wall', [1420, 2100, 3100], 'Sanitaryware', { water: 'waste', wet: true, clear: { front: 600, run: 600 }, sizes: [[1400, 800], [1200, 800], [1700, 800]] }),
  it('wc', 'Close-coupled WC', 'WC', 380, 650, 780, 0, 'wall', [360, 490, 680], 'Sanitaryware', { water: 'soil', clear: { front: 600, side: 200 } }),
  it('wcwh', 'Wall-hung WC and frame', 'WC', 360, 720, 1150, 0, 'wall', [820, 1150, 1580], 'Sanitaryware', { water: 'soil', clear: { front: 600, side: 200 } }),
  it('basin', 'Basin and pedestal', 'Basin', 550, 450, 850, 0, 'wall', [310, 440, 640], 'Sanitaryware', { water: 'waste' }),
  it('vanity', 'Vanity unit and basin', 'Vanity', 800, 460, 850, 0, 'wall', [560, 980, 1750], 'Sanitaryware', { water: 'waste', front: true, sizes: [[800, 460], [600, 460], [1200, 460]] }),
  it('towel', 'Heated towel rail', 'Rail', 500, 100, 1200, 700, 'high', [360, 520, 740], 'Sanitaryware', {}),
  it('mirror', 'Mirror cabinet', 'Mirror', 600, 150, 700, 1250, 'high', [260, 430, 690], 'Sanitaryware', { elec: true, sizes: [[600, 150], [800, 150]] }),
  it('niche', 'Tiled niche', 'Niche', 300, 100, 600, 1000, 'high', [360, 440, 540], 'Tiling and floors', {}),
  it('fan', 'Extractor fan', 'Fan', 250, 250, 60, 2340, 'ceiling', [310, 370, 440], 'Electrics', { elec: true }),
  // ---- rear extension
  it('knock', 'Knock-through with steel', 'Steel over', 3000, T, 2100, 0, 'opening', [1250, 1550, 1950], 'Structure', { per: 'm', walls: ['N'], sizes: widths(3000, 1800, 2400, 4000) }),
  it('bifold', 'Bifold doors', 'Bifold', 3000, T, 2100, 0, 'opening', [1450, 1650, 1900], 'Glazing and doors', { per: 'm', walls: OUT, glazed: true, sizes: widths(3000, 2400, 4000, 5000) }),
  it('slider', 'Sliding doors', 'Sliding', 3000, T, 2100, 0, 'opening', [1600, 1950, 2400], 'Glazing and doors', { per: 'm', walls: OUT, glazed: true, sizes: widths(3000, 2400, 4000) }),
  it('french', 'French doors', 'French', 1800, T, 2100, 0, 'opening', [1850, 2400, 3150], 'Glazing and doors', { walls: OUT, glazed: true, sizes: widths(1800, 1500) }),
  it('xwindow', 'Window', 'Window', 1200, T, 1200, 900, 'opening', [760, 1020, 1380], 'Glazing and doors', { walls: OUT, glazed: true, sizes: widths(1200, 900, 1800) }),
  it('rooflight', 'Flat rooflight', 'Rooflight', 1000, 1500, 150, 2400, 'ceiling', [1450, 1900, 2550], 'Glazing and doors', { glazed: true }),
  it('lantern', 'Roof lantern', 'Lantern', 1500, 2500, 450, 2400, 'ceiling', [3600, 4800, 6400], 'Glazing and doors', { glazed: true }),
  it('stud', 'Internal stud wall', 'Stud wall', 2400, 100, 2400, 0, 'floor', [185, 235, 295], 'Structure', { per: 'm', sizes: [[2400, 100], [1200, 100], [1800, 100], [3000, 100]] }),
  it('utility', 'Utility corner', 'Utility', 1800, 1500, 2400, 0, 'wall', [3600, 4600, 5900], 'Rooms', { water: 'waste', elec: true }),
  it('cloak', 'WC cloakroom', 'Cloakroom', 900, 1500, 2400, 0, 'wall', [3600, 4400, 5400], 'Rooms', { water: 'soil', elec: true }),
  it('burner', 'Log burner and hearth', 'Stove', 1000, 1000, 900, 0, 'wall', [2850, 3500, 4400], 'Rooms', {}),
  it('krun', 'Kitchen run', 'Kitchen', 3000, 600, 870, 0, 'wall', [1100, 1500, 2100], 'Units', { per: 'm', top: true, front: true, water: 'waste', elec: true, cooks: true, sizes: [[3000, 600], [2400, 600], [3600, 600], [4200, 600]] }),
  it('sofa', 'Sofa', 'Sofa', 2200, 950, 800, 0, 'floor', [0, 0, 0], 'Layout', { free: true, sizes: [[2200, 950], [1800, 900]] }),
  it('manhole', 'Drain or manhole here', 'MH', 600, 600, 0, 0, 'ground', [0, 0, 0], 'Layout', { free: true }),
]
const BY_KIND = new Map(ITEMS.map((d) => [d.kind, d]))
export const def = (kind: string): ItemDef => BY_KIND.get(kind) ?? ITEMS[0]

export const JOBS: Record<Job, {
  name: string; scene: string; blurb: string; size: { length: [number, number]; width: [number, number] }
  palette: string[]; pins: string[]; extras: [string, string, number, number?][]   // key, name, fixed price, price per m2
}> = {
  kitchen: {
    name: 'Kitchen refit', scene: 'kitchen', blurb: 'Units, appliances, worktops and finishes', size: { length: [2400, 7000], width: [2000, 5000] },
    palette: ['base', 'drawer', 'wallu', 'larder', 'sink', 'hob', 'oven', 'range', 'hood', 'dw', 'fridge', 'island', 'bar', 'boiler', 'table', 'door', 'window'],
    pins: ['Units along this wall', 'Sink is here now', 'This wall could come out', 'Socket needed here', 'Keep this as it is'],
    extras: [['lighting', 'Under-cabinet lighting', 680], ['rewire', 'New kitchen circuits and consumer unit', 1450], ['ufh', 'Electric underfloor heating', 350, 95], ['boiling', 'Boiling water tap', 890]],
  },
  bathroom: {
    name: 'Bathroom refit', scene: 'bathroom', blurb: 'Sanitaryware, tiling, brassware and finishes', size: { length: [1600, 4500], width: [1500, 3600] },
    palette: ['bath', 'fsbath', 'tray', 'walkin', 'wc', 'wcwh', 'basin', 'vanity', 'towel', 'mirror', 'niche', 'fan', 'door', 'window'],
    pins: ['Shower goes here', 'Toilet is here now', 'Tile this wall', 'Radiator is here', 'Keep this as it is'],
    extras: [['ufh', 'Electric underfloor heating', 280, 115], ['wetroom', 'Wet room floor, tanked with a fall to the drain', 1900], ['fulltile', 'Tile every wall to the ceiling', 0], ['lighting', 'Dimmable downlights', 540]],
  },
  extension: {
    name: 'Rear extension', scene: 'house', blurb: 'Structure, glazing, rooms and finishes', size: { length: [3000, 9000], width: [2400, 8000] },
    palette: ['knock', 'bifold', 'slider', 'french', 'xwindow', 'rooflight', 'lantern', 'stud', 'utility', 'cloak', 'krun', 'island', 'burner', 'table', 'sofa', 'manhole'],
    pins: ['Extension goes here', 'Knock through this wall', 'New doors here', 'Keep this as it is', 'Drain or manhole here'],
    extras: [['ufh', 'Wet underfloor heating', 900, 85], ['pitched', 'Pitched tiled roof in place of flat', 0, 200], ['lighting', 'Feature lighting and dimmers', 780]],
  },
}

export const FINISHES: [Finish, string, string][] = [
  ['good', 'Good', 'Your layout with trade ranges and hard-wearing finishes'],
  ['better', 'Better', 'Your layout and finishes exactly as you drew them'],
  ['best', 'Best', 'Top ranges, upgraded finishes and a ten year guarantee'],
]
const TIER: Record<Finish, 0 | 1 | 2> = { good: 0, better: 1, best: 2 }
const LUX = ['lighting', 'ufh', 'boiling']                                              // dropped from the good option
const BEST_ADDS: Record<Job, string[]> = { kitchen: ['lighting'], bathroom: ['ufh'], extension: ['ufh'] }

// ------------------------------------------------------------------------------------------ materials
export type Family = 'paint' | 'front' | 'worktop' | 'tile' | 'floor' | 'metal' | 'frame'
export type Slot = 'walls' | 'fronts' | 'worktop' | 'tile' | 'floor' | 'metal'
export type Pattern = 'flat' | 'timber' | 'vein' | 'speck' | 'terrazzo' | 'metro' | 'grid' | 'slab' | 'zellige' | 'check' | 'plank' | 'herringbone' | 'parquet' | 'concrete' | 'brushed'
export type Material = { id: string; family: Family; name: string; hex: string; hex2?: string; pattern: Pattern; sheen: string; tier: 0 | 1 | 2; price: number; unit: string; wet?: boolean }

const m = (id: string, family: Family, name: string, hex: string, pattern: Pattern, sheen: string, tier: 0 | 1 | 2, price: number, unit: string, x: Partial<Material> = {}): Material =>
  ({ id, family, name, hex, pattern, sheen, tier, price, unit, ...x })

export const MATERIALS: Material[] = [
  m('chalk', 'paint', 'Chalk Hill', '#EFEAE0', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('oat', 'paint', 'Oat Loaf', '#DDD2BE', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('mizzle', 'paint', 'Mizzle Grey', '#B9BDB4', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('sage', 'paint', 'Sage Row', '#9AA58C', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('orchard', 'paint', 'Orchard Green', '#55664F', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('harbour', 'paint', 'Harbour Blue', '#2F4858', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('slate', 'paint', 'Slate Lane', '#3C4146', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('brick', 'paint', 'Brick Dust', '#B4654A', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('pink', 'paint', 'Plaster Pink', '#D9B5A3', 'flat', 'Matt emulsion', 0, 14, 'm²'),
  m('lamp', 'paint', 'Lamp Black', '#1F2023', 'flat', 'Matt emulsion', 0, 14, 'm²'),

  m('linen', 'front', 'Linen White', '#F3F0E8', 'flat', 'Matt slab door', 0, 60, 'front'),
  m('f-sage', 'front', 'Sage Row', '#9AA58C', 'flat', 'Painted shaker, matt', 1, 95, 'front'),
  m('f-orchard', 'front', 'Orchard Green', '#55664F', 'flat', 'Painted shaker, matt', 1, 95, 'front'),
  m('f-harbour', 'front', 'Harbour Blue', '#2F4858', 'flat', 'Painted shaker, matt', 1, 95, 'front'),
  m('f-slate', 'front', 'Slate Lane', '#3C4146', 'flat', 'Painted shaker, matt', 1, 95, 'front'),
  m('f-lamp', 'front', 'Lamp Black', '#1F2023', 'flat', 'Painted shaker, matt', 1, 95, 'front'),
  m('paleoak', 'front', 'Pale Oak', '#D8BF98', 'timber', 'Oak veneer, oiled', 1, 120, 'front'),
  m('smoked', 'front', 'Smoked Oak', '#6F5640', 'timber', 'Oak veneer, lacquered', 2, 165, 'front'),
  m('walnut', 'front', 'Walnut', '#5A3E2B', 'timber', 'Walnut veneer, lacquered', 2, 190, 'front'),

  m('lamoak', 'worktop', 'Laminate Oak', '#C9A878', 'timber', 'Laminate, 38 mm', 0, 120, 'm'),
  m('beech', 'worktop', 'Solid Beech', '#D9B98C', 'timber', 'Oiled timber, 40 mm', 1, 240, 'm'),
  m('cloud', 'worktop', 'Quartz Cloud', '#ECEAE5', 'speck', 'Polished quartz, 20 mm', 1, 420, 'm'),
  m('vein', 'worktop', 'Vein White', '#F1F0EC', 'vein', 'Polished quartz, 30 mm', 2, 650, 'm', { hex2: '#B8B8B4' }),
  m('graphite', 'worktop', 'Graphite Quartz', '#3A3B3D', 'speck', 'Honed quartz, 30 mm', 2, 620, 'm'),
  m('granite', 'worktop', 'Honed Granite', '#2B2C2E', 'speck', 'Honed granite, 30 mm', 2, 590, 'm'),
  m('terrazzo', 'worktop', 'Terrazzo Speck', '#E4DDD0', 'terrazzo', 'Cast terrazzo, 30 mm', 2, 680, 'm', { hex2: '#B4654A' }),

  m('metro', 'tile', 'Gloss White Metro', '#F7F6F2', 'metro', 'Gloss, 75 x 150', 0, 68, 'm²', { wet: true }),
  m('sand', 'tile', 'Sand Porcelain', '#CFC3AE', 'grid', 'Matt, 600 x 600', 0, 82, 'm²', { wet: true }),
  m('seaglass', 'tile', 'Sea Glass', '#A9C4BB', 'metro', 'Gloss, 75 x 150', 1, 96, 'm²', { wet: true }),
  m('travertine', 'tile', 'Travertine', '#D8C7AA', 'slab', 'Honed, 300 x 600', 1, 118, 'm²', { wet: true }),
  m('check', 'tile', 'Encaustic Check', '#EFEAE0', 'check', 'Matt, 200 x 200', 2, 132, 'm²', { hex2: '#3C4146', wet: true }),
  m('zellige', 'tile', 'Ink Zellige', '#24384A', 'zellige', 'Handmade gloss, 100 x 100', 2, 148, 'm²', { wet: true }),

  m('lvt', 'floor', 'LVT Stone', '#BDB5A6', 'slab', 'Luxury vinyl tile', 0, 58, 'm²', { wet: true }),
  m('plank', 'floor', 'Whitewashed Plank', '#DCCDB6', 'plank', 'Engineered plank, 180 mm', 0, 66, 'm²'),
  m('herring', 'floor', 'Herringbone Oak', '#C49A6C', 'herringbone', 'Engineered block, 70 x 280', 1, 118, 'm²'),
  m('concrete', 'floor', 'Polished Concrete', '#A9A8A3', 'concrete', 'Microcement, sealed', 1, 105, 'm²', { wet: true }),
  m('parquet', 'floor', 'Dark Parquet', '#5B4331', 'parquet', 'Solid block, basket weave', 2, 142, 'm²'),

  m('chrome', 'metal', 'Chrome', '#C9CDD1', 'brushed', 'Polished', 0, 18, 'fitting'),
  m('nickel', 'metal', 'Brushed Nickel', '#A7A49C', 'brushed', 'Brushed', 1, 32, 'fitting'),
  m('black', 'metal', 'Matt Black', '#1F2023', 'flat', 'Powder coated', 1, 34, 'fitting'),
  m('brass', 'metal', 'Brushed Brass', '#B08D57', 'brushed', 'Brushed, lacquered', 2, 52, 'fitting'),

  m('fr-white', 'frame', 'Chalk White frames', '#F3F0E8', 'flat', 'Powder coated aluminium', 0, 0, 'm'),
  m('fr-anth', 'frame', 'Slate Lane frames', '#3C4146', 'flat', 'Powder coated aluminium', 1, 35, 'm'),
  m('fr-black', 'frame', 'Lamp Black frames', '#1F2023', 'flat', 'Powder coated aluminium', 1, 35, 'm'),
  m('fr-bronze', 'frame', 'Bronze frames', '#6B5A45', 'brushed', 'Anodised aluminium', 2, 90, 'm'),
]
const MAT = new Map(MATERIALS.map((x) => [x.id, x]))
export const mat = (id: string | undefined): Material => MAT.get(id ?? '') ?? MATERIALS[0]

export const SLOT: Record<Slot, { ref: string; name: Record<Job, string> }> = {
  walls: { ref: 'PT-01', name: { kitchen: 'Walls and ceiling', bathroom: 'Walls and ceiling', extension: 'Walls and ceiling' } },
  fronts: { ref: 'CF-01', name: { kitchen: 'Cabinet fronts', bathroom: 'Vanity front', extension: 'Cabinet fronts' } },
  worktop: { ref: 'WT-01', name: { kitchen: 'Worktops', bathroom: 'Worktops', extension: 'Worktops' } },
  tile: { ref: 'TL-01', name: { kitchen: 'Splashback tiles', bathroom: 'Wall tiles', extension: 'Wall tiles' } },
  floor: { ref: 'FL-01', name: { kitchen: 'Floor', bathroom: 'Floor', extension: 'Floor' } },
  metal: { ref: 'MT-01', name: { kitchen: 'Tap and handles', bathroom: 'Brassware', extension: 'Door and window frames' } },
}

/** The materials a slot may take for a job. A bathroom floor takes only finishes that cope with water. */
export function choices(job: Job, slot: Slot): Material[] {
  if (slot === 'walls') return MATERIALS.filter((x) => x.family === 'paint')
  if (slot === 'fronts') return MATERIALS.filter((x) => x.family === 'front')
  if (slot === 'worktop') return MATERIALS.filter((x) => x.family === 'worktop')
  if (slot === 'tile') return MATERIALS.filter((x) => x.family === 'tile')
  if (slot === 'floor') return job === 'bathroom' ? MATERIALS.filter((x) => (x.family === 'floor' || x.family === 'tile') && x.wet && x.pattern !== 'metro' && x.pattern !== 'zellige') : MATERIALS.filter((x) => x.family === 'floor')
  return MATERIALS.filter((x) => x.family === (job === 'extension' ? 'frame' : 'metal'))
}

export const SCHEMES: { key: string; name: string; line: string; mats: Record<Slot, string>; bathFloor: string; frame: string }[] = [
  { key: 'chalk', name: 'Quiet Chalk', line: 'Pale, calm and easy to live with', mats: { walls: 'chalk', fronts: 'linen', worktop: 'cloud', tile: 'metro', floor: 'plank', metal: 'nickel' }, bathFloor: 'lvt', frame: 'fr-white' },
  { key: 'orchard', name: 'Orchard', line: 'Green fronts, warm timber, brass', mats: { walls: 'oat', fronts: 'f-orchard', worktop: 'beech', tile: 'sand', floor: 'herring', metal: 'brass' }, bathFloor: 'travertine', frame: 'fr-bronze' },
  { key: 'harbour', name: 'Harbour', line: 'Deep blue against white stone', mats: { walls: 'mizzle', fronts: 'f-harbour', worktop: 'vein', tile: 'seaglass', floor: 'concrete', metal: 'chrome' }, bathFloor: 'concrete', frame: 'fr-anth' },
  { key: 'ink', name: 'Ink and Brass', line: 'Dark, graphic, a little theatrical', mats: { walls: 'pink', fronts: 'f-lamp', worktop: 'terrazzo', tile: 'zellige', floor: 'parquet', metal: 'brass' }, bathFloor: 'check', frame: 'fr-black' },
]

// ------------------------------------------------------------------------------------------ the scene
export type Placed = { id: string; kind: string; x: number; y: number; rot: Rot; v?: number }   // x, y: top left of the footprint, mm
export type Scene = {
  job: Job; layout: string; scheme: string
  length: number; width: number; height: number     // mm. Length runs west to east, width north to south.
  items: Placed[]; mats: Record<Slot, string>; extras: string[]
  svc: { wall: Wall; at: number } | null             // the drain gully (kitchen) or soil stack (bathroom)
  site: { house: 'attached' | 'detached'; boundary: number }   // rear extension only: house type, distance to the side boundary
}

export function schemeMats(job: Job, key: string): Record<Slot, string> {
  const s = SCHEMES.find((x) => x.key === key) ?? SCHEMES[0]
  return { ...s.mats, floor: job === 'bathroom' ? s.bathFloor : s.mats.floor, metal: job === 'extension' ? s.frame : s.mats.metal }
}

/** The slots that matter for this scene: what the finishes schedule lists and the price counts. */
export function slotsFor(s: Scene): Slot[] {
  if (s.job === 'kitchen') return ['floor', 'fronts', 'worktop', 'tile', 'walls', 'metal']
  if (s.job === 'bathroom') return [...(['floor', 'tile'] as Slot[]), ...(s.items.some((p) => def(p.kind).front) ? ['fronts' as Slot] : []), 'walls', 'metal']
  return [...(['floor'] as Slot[]), ...(s.items.some((p) => def(p.kind).top) ? ['fronts' as Slot, 'worktop' as Slot] : []), 'walls', 'metal']
}

// ------------------------------------------------------------------------------------------ geometry
export const dims = (p: Pick<Placed, 'kind' | 'v'>): [number, number] => { const d = def(p.kind); return d.sizes?.[p.v ?? 0] ?? [d.w, d.d] }
export function box(p: Placed): Box { const [w, d] = dims(p); return p.rot % 180 === 0 ? { x: p.x, y: p.y, w, h: d } : { x: p.x, y: p.y, w: d, h: w } }
export const hit = (a: Box, b: Box, tol = 20) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > tol && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > tol
const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(Math.max(lo, hi), v))
const g50 = (v: number) => Math.round(v / 50) * 50
const layers = (d: ItemDef): string[] => d.mount === 'opening' ? ['open'] : d.mount === 'ceiling' ? ['ceil'] : d.mount === 'ground' ? ['ground'] : d.mount === 'high' ? ['high'] : d.tall ? ['floor', 'high'] : ['floor']
export const clash = (a: ItemDef, b: ItemDef) => a.mount !== 'ground' && layers(a).some((l) => layers(b).includes(l))
const solid = (d: ItemDef) => d.mount === 'wall' || d.mount === 'floor'

/** The wall an item's back is against, or null if it stands free. */
export function wallOf(s: Scene, p: Placed): Wall | null {
  const d = def(p.kind), b = box(p)
  if (d.mount === 'opening') return WALL_OF[p.rot]
  if (d.mount !== 'wall' && d.mount !== 'high') return null
  return p.rot === 0 ? (b.y === 0 ? 'N' : null) : p.rot === 90 ? (b.x + b.w === s.length ? 'E' : null) : p.rot === 180 ? (b.y + b.h === s.width ? 'S' : null) : b.x === 0 ? 'W' : null
}
/** Where an item starts and ends along its wall, in plan coordinates. */
export const span = (p: Placed): [number, number] => { const b = box(p); return p.rot % 180 === 0 ? [b.x, b.x + b.w] : [b.y, b.y + b.h] }
const lenOf = (s: Scene, wall: Wall) => (wall === 'N' || wall === 'S' ? s.length : s.width)

function atWall(s: Scene, wall: Wall, along: number, d: number, opening: boolean) {
  if (wall === 'N') return { x: along, y: opening ? -T : 0 }
  if (wall === 'S') return { x: along, y: opening ? s.width : s.width - d }
  if (wall === 'W') return { x: opening ? -T : 0, y: along }
  return { x: opening ? s.length : s.length - d, y: along }
}

// Snap one axis: my leading edge to walls and to the trailing edges of neighbours, my trailing edge to their leading edges.
function snap1(pos: number, size: number, max: number, starts: number[], ends: number[]): { pos: number; at: number | null } {
  let best: { delta: number; at: number } | null = null
  for (const c of starts) { const delta = c - pos; if (Math.abs(delta) <= 90 && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, at: c } }
  for (const c of ends) { const delta = c - (pos + size); if (Math.abs(delta) <= 90 && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, at: c } }
  const out = clampN(best ? pos + best.delta : g50(pos), 0, max - size)
  return { pos: out, at: best && out === pos + best.delta ? best.at : null }
}

/** Put an item with its centre at (cx, cy): wall items within 300 mm of a wall turn to face out and lock to it,
 *  edges snap to neighbours and walls, everything stays inside the room. Returns the placed item and the snap guides. */
export function place(s: Scene, p: Placed, cx: number, cy: number): { p: Placed; guides: Seg[] } {
  const d = def(p.kind), [w, dp] = dims(p), L = s.length, W = s.width
  if (d.mount === 'opening') {
    const dist: Record<Wall, number> = { N: cy, S: W - cy, W: cx, E: L - cx }
    const wall = (d.walls ?? WALLS).reduce((a, b) => (dist[b] < dist[a] ? b : a))
    const len = lenOf(s, wall)
    let along = g50((wall === 'N' || wall === 'S' ? cx : cy) - w / 2)
    if (Math.abs(along + w / 2 - len / 2) <= 100) along = (len - w) / 2
    along = clampN(along, 0, len - w)
    return { p: { ...p, rot: ROT[wall], ...atWall(s, wall, along, dp, true) }, guides: [] }
  }
  let rot = p.rot, wall: Wall | null = null
  if (d.mount === 'wall' || d.mount === 'high') {
    const gap: Record<Wall, number> = { N: cy - dp / 2, S: W - cy - dp / 2, W: cx - dp / 2, E: L - cx - dp / 2 }
    const near = (d.walls ?? WALLS).reduce((a, b) => (gap[b] < gap[a] ? b : a))
    if (d.mount === 'high' || gap[near] <= 300) wall = near
  }
  if (wall) rot = ROT[wall]
  const fw = rot % 180 === 0 ? w : dp, fh = rot % 180 === 0 ? dp : w
  let x = cx - fw / 2, y = cy - fh / 2
  if (wall === 'W') x = 0; if (wall === 'E') x = L - fw; if (wall === 'N') y = 0; if (wall === 'S') y = W - fh
  const others = s.items.filter((o) => o.id !== p.id && clash(def(o.kind), d)).map(box)
  const guides: Seg[] = []
  if (wall !== 'W' && wall !== 'E') {
    const near = others.filter((b) => Math.min(y + fh, b.y + b.h) - Math.max(y, b.y) > 0)
    const r = snap1(x, fw, L, [0, ...near.map((b) => b.x + b.w)], [L, ...near.map((b) => b.x)])
    x = r.pos; if (r.at !== null && r.at !== 0 && r.at !== L) guides.push({ x1: r.at, y1: y - 250, x2: r.at, y2: y + fh + 250 })
  }
  if (wall !== 'N' && wall !== 'S') {
    const near = others.filter((b) => Math.min(x + fw, b.x + b.w) - Math.max(x, b.x) > 0)
    const r = snap1(y, fh, W, [0, ...near.map((b) => b.y + b.h)], [W, ...near.map((b) => b.y)])
    y = r.pos; if (r.at !== null && r.at !== 0 && r.at !== W) guides.push({ x1: x - 250, y1: r.at, x2: x + fw + 250, y2: r.at })
  }
  return { p: { ...p, rot, x: clampN(x, 0, L - fw), y: clampN(y, 0, W - fh) }, guides }
}

/** Clear distances from an item to whatever is next to it, for the live dimensions while dragging. */
export function gaps(s: Scene, p: Placed): (Seg & { mm: number })[] {
  const d = def(p.kind), b = box(p), L = s.length, W = s.width, out: (Seg & { mm: number })[] = []
  if (d.mount === 'opening') {
    const wall = WALL_OF[p.rot], [a, z] = span(p), len = lenOf(s, wall), off = 260
    const pt = (v: number) => (wall === 'N' ? [v, off] : wall === 'S' ? [v, W - off] : wall === 'W' ? [off, v] : [L - off, v])
    for (const [from, to] of [[0, a], [z, len]]) if (to - from > 0) { const [x1, y1] = pt(from), [x2, y2] = pt(to); out.push({ x1, y1, x2, y2, mm: to - from }) }
    return out
  }
  const others = s.items.filter((o) => o.id !== p.id && clash(def(o.kind), d)).map(box)
  const ov = (a1: number, a2: number, b1: number, b2: number) => Math.min(a2, b2) - Math.max(a1, b1) > 0
  const rowers = others.filter((o) => ov(b.y, b.y + b.h, o.y, o.y + o.h)), colers = others.filter((o) => ov(b.x, b.x + b.w, o.x, o.x + o.w))
  const left = Math.max(0, ...rowers.filter((o) => o.x + o.w <= b.x + 1).map((o) => o.x + o.w)), right = Math.min(L, ...rowers.filter((o) => o.x >= b.x + b.w - 1).map((o) => o.x))
  const up = Math.max(0, ...colers.filter((o) => o.y + o.h <= b.y + 1).map((o) => o.y + o.h)), down = Math.min(W, ...colers.filter((o) => o.y >= b.y + b.h - 1).map((o) => o.y))
  const my = b.y + b.h / 2, mx = b.x + b.w / 2
  if (b.x - left > 0) out.push({ x1: left, y1: my, x2: b.x, y2: my, mm: b.x - left })
  if (right - (b.x + b.w) > 0) out.push({ x1: b.x + b.w, y1: my, x2: right, y2: my, mm: right - (b.x + b.w) })
  if (b.y - up > 0) out.push({ x1: mx, y1: up, x2: mx, y2: b.y, mm: b.y - up })
  if (down - (b.y + b.h) > 0) out.push({ x1: mx, y1: b.y + b.h, x2: mx, y2: down, mm: down - (b.y + b.h) })
  return out
}

export type Zone = Box & { kind: 'front' | 'around' | 'swing'; run?: number; axis: 'x' | 'y' }
/** The space an item needs kept clear: in front of it, all round it, or the swing of a door. Clipped to the room. */
export function zones(s: Scene, p: Placed): Zone[] {
  const c = def(p.kind).clear, b = box(p), out: Zone[] = []
  if (!c) return out
  const axis = p.rot % 180 === 0 ? 'x' : 'y', side = c.side ?? 0
  if (c.front) {
    const f = c.front
    const z = p.rot === 0 ? { x: b.x - side, y: b.y + b.h, w: b.w + 2 * side, h: f } : p.rot === 180 ? { x: b.x - side, y: b.y - f, w: b.w + 2 * side, h: f }
      : p.rot === 90 ? { x: b.x - f, y: b.y - side, w: f, h: b.h + 2 * side } : { x: b.x + b.w, y: b.y - side, w: f, h: b.h + 2 * side }
    out.push({ ...z, kind: 'front', run: c.run, axis })
  }
  if (c.around) out.push({ x: b.x - c.around, y: b.y - c.around, w: b.w + 2 * c.around, h: b.h + 2 * c.around, kind: 'around', axis })
  if (c.swing) {
    const w = dims(p)[0], wall = WALL_OF[p.rot]
    out.push({ ...(wall === 'N' ? { x: b.x, y: 0 } : wall === 'S' ? { x: b.x, y: s.width - w } : wall === 'W' ? { x: 0, y: b.y } : { x: s.length - w, y: b.y }), w, h: w, kind: 'swing', axis })
  }
  return out.map((z) => { const x = Math.max(0, z.x), y = Math.max(0, z.y); return { ...z, x, y, w: Math.min(s.length, z.x + z.w) - x, h: Math.min(s.width, z.y + z.h) - y } })
}

// ------------------------------------------------------------------------------------------ design rules
export type Warning = { code: string; level: 'warn' | 'note'; text: string; ids: string[]; zone?: Zone }
const low = (name: string) => name.charAt(0).toLowerCase() + name.slice(1)
const The = (p: Placed) => 'The ' + low(def(p.kind).name.split(',')[0])
const the = (p: Placed) => 'the ' + low(def(p.kind).name.split(',')[0])
const mm = (v: number) => Math.round(v).toLocaleString('en-GB') + ' mm'
const centre = (p: Placed) => { const b = box(p); return { x: b.x + b.w / 2, y: b.y + b.h / 2 } }
/** Straight gap between two footprints: the larger of the horizontal and vertical separations. */
export const rectGap = (a: Box, b: Box) => Math.max(Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), 0), Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h), 0))
/** How far a pipe runs from a fixture to the drain or soil stack, along the walls. */
export function pipeRun(s: Scene, p: Placed): number {
  if (!s.svc) return 0
  const c = centre(p), w = s.svc.wall, at = s.svc.at
  const sx = w === 'N' || w === 'S' ? at : w === 'W' ? 0 : s.length, sy = w === 'N' ? 0 : w === 'S' ? s.width : at
  return Math.abs(c.x - sx) + Math.abs(c.y - sy)
}
export const WASTE_FREE = 3000, SOIL_FREE = 2000   // pipe runs up to these lengths are in the base price

/** Bramley's design rules, run on every move. They advise and never block: the builder decides on site. */
export function check(s: Scene): Warning[] {
  const out: Warning[] = [], items = s.items, D = (p: Placed) => def(p.kind)
  const add = (code: string, level: Warning['level'], text: string, ids: string[], zone?: Zone) => out.push({ code, level, text, ids, zone })
  const solids = items.filter((p) => solid(D(p)))

  // anything on the same layer sharing the same space
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j]
    if (clash(D(a), D(b)) && hit(box(a), box(b))) add('overlap', 'warn', `${The(a)} and ${the(b)} share the same space. Slide one along.`, [a.id, b.id])
  }
  // clear space: in front, all round, door swings
  for (const p of items) for (const z of zones(s, p)) {
    const c = D(p).clear!
    if (z.kind === 'around') {
      const b = box(p), min = c.min ?? c.around!
      const tight = solids.filter((o) => o.id !== p.id).map((o) => ({ o, g: rectGap(b, box(o)), diag: !hit({ ...b, x: -1e6, w: 2e6 }, box(o), 0) && !hit({ ...b, y: -1e6, h: 2e6 }, box(o), 0) }))
        .filter((t) => !t.diag && t.g > 0 && t.g < min).sort((x, y) => x.g - y.g)[0]
      const walls = [b.x, s.length - b.x - b.w, b.y, s.width - b.y - b.h].filter((g) => g > 0 && g < min).sort((x, y) => x - y)[0]
      if (tight && (walls === undefined || tight.g <= walls)) add('around', 'warn', `Only ${mm(tight.g)} between ${the(p)} and ${the(tight.o)}. We aim for ${mm(c.around!)}.`, [p.id, tight.o.id], z)
      else if (walls !== undefined) add('around', 'warn', `Only ${mm(walls)} between ${the(p)} and the wall. We aim for ${mm(c.around!)}.`, [p.id], z)
      continue
    }
    const blockers = solids.filter((o) => o.id !== p.id && hit(z, box(o)))
    if (!blockers.length) continue
    if (z.run) {   // some of the zone may be blocked as long as a clear stretch of `run` remains
      const a0 = z.axis === 'x' ? z.x : z.y, a1 = a0 + (z.axis === 'x' ? z.w : z.h)
      const cuts = blockers.map((o) => { const b = box(o); return z.axis === 'x' ? [b.x, b.x + b.w] : [b.y, b.y + b.h] }).sort((x, y) => x[0] - y[0])
      let at = a0, free = 0
      for (const [c0, c1] of cuts) { free = Math.max(free, c0 - at); at = Math.max(at, c1) }
      if (Math.max(free, a1 - at) >= z.run) continue
    }
    const what = z.kind === 'swing' ? `${The(blockers[0])} is in the swing of the door.` : `${The(p)} needs ${mm(c.front!)} clear in front. ${The(blockers[0])} is in the way.`
    add(z.kind, 'warn', what, [p.id, blockers[0].id], z)
  }
  // tall and wall-hung things across a window
  const windows = items.filter((p) => p.kind === 'window' || p.kind === 'xwindow')
  for (const p of items) {
    const d = D(p), wall = wallOf(s, p)
    if (!wall || d.mount === 'opening' || !(d.mount === 'high' || d.tall || d.cooks)) continue
    const [a, z] = span(p)
    const win = windows.find((o) => WALL_OF[o.rot] === wall && Math.min(z, span(o)[1]) - Math.max(a, span(o)[0]) > 20)
    if (win) add('window', 'warn', d.cooks ? `${The(p)} is under the window. A hob wants a solid wall behind it.` : `${The(p)} crosses the window.`, [p.id, win.id])
  }

  if (s.job === 'kitchen') {
    const sink = items.find((p) => p.kind === 'sink'), cooks = items.filter((p) => D(p).cooks), fridge = items.find((p) => p.kind === 'fridge')
    for (const dw of items.filter((p) => p.kind === 'dw')) if (sink && rectGap(box(dw), box(sink)) > 600) add('dw', 'warn', 'The dishwasher is more than one unit from the sink. Keep them together so they share the waste.', [dw.id, sink.id])
    for (const hob of cooks) {
      if (sink && rectGap(box(hob), box(sink)) < 600) add('sinkhob', 'warn', `Under 600 mm between ${the(hob)} and the sink. Leave a unit of worktop between them.`, [hob.id, sink.id])
      const wall = wallOf(s, hob), [a, z] = span(hob)
      const tall = wall && items.find((o) => o.id !== hob.id && D(o).tall && wallOf(s, o) === wall && Math.max(span(o)[0] - z, a - span(o)[1]) < 300)
      if (tall) add('hobside', 'warn', `${The(hob)} is hard against ${the(tall)}. Leave 300 mm of worktop each side.`, [hob.id, tall.id])
      if (!items.some((o) => o.kind === 'hood' && hit(box(o), box(hob)))) add('hood', 'note', `No extractor over ${the(hob)}. Drag a hood on to the same wall.`, [hob.id])
    }
    if (sink && cooks[0] && fridge) {
      const a = centre(sink), b = centre(cooks[0]), c = centre(fridge), sum = Math.hypot(a.x - b.x, a.y - b.y) + Math.hypot(b.x - c.x, b.y - c.y) + Math.hypot(c.x - a.x, c.y - a.y)
      if (sum < 4000 || sum > 7900) add('triangle', 'note', `The walk between sink, hob and fridge is ${(sum / 1000).toFixed(1)} m. Between 4 and 7.9 m feels right.`, [sink.id, cooks[0].id, fridge.id])
    }
    if (sink && pipeRun(s, sink) > WASTE_FREE) add('waste', 'note', `The sink is ${(pipeRun(s, sink) / 1000).toFixed(1)} m from the drain. A longer waste run has been added to the price.`, [sink.id])
  }
  if (s.job === 'bathroom') {
    for (const wc of items.filter((p) => D(p).water === 'soil')) if (pipeRun(s, wc) > SOIL_FREE) add('soil', 'note', `The WC is ${(pipeRun(s, wc) / 1000).toFixed(1)} m from the soil stack. A new soil run has been added to the price.`, [wc.id])
    const fan = items.find((p) => p.kind === 'fan')
    if (!fan && !windows.length) add('fan', 'warn', 'No window and no extractor fan. A bathroom needs one or the other. Add a fan from the list.', [])
    const wet = fan && items.find((p) => D(p).wet && hit(box(p), box(fan), 0))
    if (fan && wet) add('fanzone', 'note', `The fan is over ${the(wet)}. Our electrician fits one rated for that position.`, [fan.id])
  }
  if (s.job === 'extension') {
    if (!items.some((p) => p.kind === 'knock')) add('knock', 'note', 'No opening into the house yet. Add a knock-through on the house wall.', [])
    const lantern = items.find((p) => p.kind === 'lantern')
    if (lantern && s.extras.includes('pitched')) add('lantern', 'warn', 'A roof lantern needs a flat roof. Switch off the pitched roof or use a rooflight.', [lantern.id])
  }
  return out
}

// ------------------------------------------------------------------------------------------ editing helpers
const nextId = (s: Scene) => 'i' + (Math.max(0, ...s.items.map((p) => +p.id.slice(1) || 0)) + 1)

/** A sensible free spot for a new item: the first clear stretch of wall, or the middle of the room. */
export function findSpot(s: Scene, kind: string): Placed {
  const d = def(kind), p: Placed = { id: nextId(s), kind, x: 0, y: 0, rot: 0 }, [w, dp] = dims(p)
  const others = s.items.filter((o) => clash(def(o.kind), d)).map(box)
  const free = (q: Placed) => !others.some((o) => hit(box(q), o, 1))
  if (d.mount === 'wall' || d.mount === 'high' || d.mount === 'opening') {
    for (const wall of d.walls ?? WALLS) for (let a = 0; a + w <= lenOf(s, wall); a += 50) {
      const q = { ...p, rot: ROT[wall], ...atWall(s, wall, a, dp, d.mount === 'opening') }
      if (free(q)) return q
    }
    const wall = (d.walls ?? WALLS)[0]
    return { ...p, rot: ROT[wall], ...atWall(s, wall, 0, dp, d.mount === 'opening') }
  }
  const cx = s.length / 2, cy = s.width / 2
  const spots: [number, number][] = []
  for (let x = w / 2; x <= s.length - w / 2; x += 200) for (let y = dp / 2; y <= s.width - dp / 2; y += 200) spots.push([x, y])
  spots.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy))
  for (const [x, y] of spots) { const q = place(s, p, x, y).p; if (free(q)) return q }
  return place(s, p, cx, cy).p
}

export const addItem = (s: Scene, p: Placed): Scene => ({ ...s, items: [...s.items, p] })
export const moveItem = (s: Scene, p: Placed): Scene => ({ ...s, items: s.items.map((o) => (o.id === p.id ? p : o)) })
export const removeItem = (s: Scene, id: string): Scene => ({ ...s, items: s.items.filter((o) => o.id !== id) })

/** Turn an item a quarter turn. Wall items move round to face out from the next wall. */
export function rotateItem(s: Scene, id: string): Scene {
  const p = s.items.find((o) => o.id === id)
  if (!p) return s
  const d = def(p.kind), c = centre(p), [, dp] = dims(p)
  if (d.mount === 'floor' || d.mount === 'ceiling' || d.mount === 'ground') return moveItem(s, place(s, { ...p, rot: ((p.rot + 90) % 360) as Rot }, c.x, c.y).p)
  const allowed = d.walls ?? WALLS, wall = allowed[(allowed.indexOf(WALL_OF[p.rot]) + 1) % allowed.length]
  const half = d.mount === 'opening' ? 0 : dp / 2
  const t = wall === 'N' ? [c.x, half] : wall === 'S' ? [c.x, s.width - half] : wall === 'W' ? [half, c.y] : [s.length - half, c.y]
  return moveItem(s, place(s, { ...p, rot: ROT[wall] }, t[0], t[1]).p)
}

export function duplicateItem(s: Scene, id: string): Scene {
  const p = s.items.find((o) => o.id === id)
  if (!p) return s
  const spot = findSpot(s, p.kind), q = { ...p, id: spot.id }
  const b = box(p), w = wallOf(s, p)
  // try straight after the original along its wall, else the first free spot
  const tryAt = w ? place(s, q, b.x + b.w / 2 + (p.rot % 180 === 0 ? b.w : 0), b.y + b.h / 2 + (p.rot % 180 === 0 ? 0 : b.h)).p : null
  const others = s.items.filter((o) => clash(def(o.kind), def(p.kind))).map(box)
  const ok = tryAt && !others.some((o) => hit(box(tryAt), o, 1))
  return addItem(s, ok && tryAt ? tryAt : { ...spot, v: p.v, ...(def(p.kind).mount === 'floor' ? { rot: p.rot } : {}) })
}

export function setSize(s: Scene, id: string, v: number): Scene {
  const p = s.items.find((o) => o.id === id)
  if (!p) return s
  const c = centre(p), d = def(p.kind), [, dp] = dims({ kind: p.kind, v })
  const w = wallOf(s, p)
  // keep a wall item on its wall when its depth changes
  const cy = w === 'N' ? dp / 2 : w === 'S' ? s.width - dp / 2 : c.y, cx = w === 'W' ? dp / 2 : w === 'E' ? s.length - dp / 2 : c.x
  return moveItem(s, place(s, { ...p, v }, d.mount === 'opening' ? c.x : cx, d.mount === 'opening' ? c.y : cy).p)
}

/** Change the room size. Things on the far walls travel with them; everything else stays put and is kept inside. */
export function resize(s: Scene, length: number, width: number): Scene {
  const j = JOBS[s.job], L = clampN(g50(length), j.size.length[0], j.size.length[1]), W = clampN(g50(width), j.size.width[0], j.size.width[1])
  const items = s.items.map((p) => {
    const d = def(p.kind), b = box(p)
    let { x, y } = p
    if (d.mount === 'opening') {
      const wall = WALL_OF[p.rot]
      if (wall === 'E') x = L; if (wall === 'S') y = W
      if (wall === 'N' || wall === 'S') x = clampN(x, 0, L - b.w); else y = clampN(y, 0, W - b.h)
      return { ...p, x, y }
    }
    if (b.x + b.w >= s.length) x = L - b.w
    if (b.y + b.h >= s.width) y = W - b.h
    return { ...p, x: clampN(x, 0, L - b.w), y: clampN(y, 0, W - b.h) }
  })
  const svc = s.svc ? { ...s.svc, at: Math.min(s.svc.at, lenOf({ ...s, length: L, width: W }, s.svc.wall) - 200) } : null
  return { ...s, length: L, width: W, items, svc }
}

export function applyScheme(s: Scene, key: string): Scene { return { ...s, scheme: key, mats: schemeMats(s.job, key) } }

// ------------------------------------------------------------------------------------------ furnished templates
type Spec = string | [string, number]   // kind, or kind and size index
function run(s: { length: number; width: number }, wall: Wall, from: number, specs: Spec[]): Omit<Placed, 'id'>[] {
  let at = from
  return specs.map((sp) => {
    const [kind, v] = typeof sp === 'string' ? [sp, 0] : sp
    const [w, d] = dims({ kind, v }), opening = def(kind).mount === 'opening'
    const p = { kind, v, rot: ROT[wall], ...atWall(s as Scene, wall, at, d, opening) }
    at += w
    return p
  })
}
const on = (s: { length: number; width: number }, wall: Wall, at: number, kind: string, v = 0) => run(s, wall, at, [[kind, v]])[0]
const freeAt = (kind: string, x: number, y: number, rot: Rot = 0, v = 0): Omit<Placed, 'id'> => ({ kind, v, rot, x, y })

type Template = { key: string; name: string; line: string; length: number; width: number; scheme: string; svc: Scene['svc']; extras?: string[]; items: (r: { length: number; width: number }) => Omit<Placed, 'id'>[] }
export const TEMPLATES: Record<Job, Template[]> = {
  kitchen: [
    { key: 'galley', name: 'Galley', line: 'Two runs facing each other', length: 3600, width: 2700, scheme: 'harbour', svc: { wall: 'S', at: 1700 }, items: (r) => [
      ...run(r, 'N', 0, ['larder', 'base', 'hob', 'base', 'drawer', ['base', 1]]),
      ...run(r, 'N', 600, ['wallu', 'hood', 'wallu', 'wallu', 'wallu']),
      ...run(r, 'S', 0, ['fridge', 'dw', 'sink', 'base', ['base', 2]]),
      on(r, 'S', 3000, 'boiler'), on(r, 'W', 900, 'door'), on(r, 'E', 750, 'window'),
    ] },
    { key: 'lshape', name: 'L-shape', line: 'Two walls and room for a table', length: 4200, width: 3300, scheme: 'orchard', svc: { wall: 'N', at: 1900 }, items: (r) => [
      ...run(r, 'N', 0, ['base', 'drawer', 'sink', 'dw', 'base', 'fridge']),
      ...run(r, 'W', 600, ['base', 'hob', 'base', 'oven']),
      ...run(r, 'N', 0, ['wallu', 'wallu']), on(r, 'N', 2700, 'wallu'),
      ...run(r, 'W', 600, ['wallu', 'hood', 'wallu']),
      on(r, 'N', 1500, 'window'), on(r, 'S', 3000, 'door'), freeAt('table', 1300, 1600),
    ] },
    { key: 'island', name: 'Island', line: 'A long run, a tall bank and an island', length: 5100, width: 4000, scheme: 'ink', svc: { wall: 'N', at: 3400 }, items: (r) => [
      ...run(r, 'N', 0, ['base', 'drawer', ['hob', 1], 'dw', 'sink', 'drawer', ['base', 1]]),
      ...run(r, 'W', 600, ['fridge', 'oven', 'larder']),
      ...run(r, 'N', 0, ['wallu', 'wallu']), on(r, 'N', 1400, 'hood', 1), on(r, 'N', 4000, 'wallu'),
      on(r, 'N', 2800, 'window'), on(r, 'S', 300, 'door'),
      freeAt('island', 1900, 1900), freeAt('bar', 2050, 2800),
    ] },
  ],
  bathroom: [
    { key: 'bath', name: 'Family bath', line: 'Bath, WC and a vanity', length: 2500, width: 2200, scheme: 'chalk', svc: { wall: 'N', at: 2150 }, items: (r) => [
      on(r, 'N', 0, 'bath'), on(r, 'N', 1960, 'wc'), on(r, 'S', 300, 'vanity'), on(r, 'S', 400, 'mirror'), on(r, 'S', 1250, 'towel'),
      on(r, 'E', 1300, 'door'), on(r, 'W', 1050, 'window', 1),
    ] },
    { key: 'walkin', name: 'Walk-in shower', line: 'No bath, a big shower and a wall-hung WC', length: 2800, width: 1900, scheme: 'harbour', svc: { wall: 'N', at: 1880 }, items: (r) => [
      on(r, 'N', 0, 'walkin'), on(r, 'N', 1700, 'wcwh'), on(r, 'S', 1700, 'vanity'), on(r, 'S', 1800, 'mirror'), on(r, 'N', 550, 'niche'),
      on(r, 'E', 250, 'towel'), on(r, 'S', 300, 'door'), freeAt('fan', 2150, 950),
    ] },
    { key: 'suite', name: 'Bath and shower', line: 'A freestanding bath and a separate shower', length: 3200, width: 2400, scheme: 'orchard', svc: { wall: 'N', at: 1390 }, items: (r) => [
      on(r, 'N', 0, 'tray'), on(r, 'N', 1200, 'wc'), on(r, 'S', 1000, 'vanity', 2), on(r, 'S', 1200, 'mirror', 1), on(r, 'N', 1800, 'towel'),
      freeAt('fsbath', 2350, 350, 90), on(r, 'W', 1250, 'door'), on(r, 'E', 600, 'window'), freeAt('fan', 400, 1100),
    ] },
  ],
  extension: [
    { key: 'diner', name: 'Kitchen diner', line: 'Three metres out, kitchen down one side', length: 5400, width: 3000, scheme: 'orchard', svc: null, items: (r) => [
      on(r, 'N', 1200, 'knock'), on(r, 'S', 1200, 'bifold'), on(r, 'W', 0, 'krun'), on(r, 'E', 900, 'xwindow'),
      freeAt('rooflight', 1400, 700), freeAt('rooflight', 3300, 700), freeAt('table', 2600, 1150, 0, 0),
    ] },
    { key: 'family', name: 'Family room', line: 'Four metres out with a lantern and a stove', length: 6000, width: 4000, scheme: 'chalk', svc: null, items: (r) => [
      on(r, 'N', 1000, 'knock', 3), on(r, 'S', 1000, 'slider', 2), on(r, 'E', 1500, 'burner'),
      freeAt('lantern', 2250, 750), freeAt('sofa', 300, 900, 270),
    ] },
    { key: 'works', name: 'Kitchen, utility and WC', line: 'An island kitchen with a utility and cloakroom', length: 6500, width: 3600, scheme: 'harbour', svc: null, extras: ['ufh'], items: (r) => [
      on(r, 'N', 0, 'utility'), on(r, 'N', 1800, 'cloak'), on(r, 'N', 2800, 'knock'), on(r, 'E', 0, 'krun', 2), on(r, 'S', 1900, 'bifold', 2),
      freeAt('island', 3000, 1700), freeAt('rooflight', 3000, 150), freeAt('rooflight', 4500, 150),
    ] },
  ],
}

export function fromTemplate(job: Job, key?: string): Scene {
  const t = TEMPLATES[job].find((x) => x.key === key) ?? TEMPLATES[job][0]
  return {
    job, layout: t.key, scheme: t.scheme, length: t.length, width: t.width, height: 2400,
    items: t.items(t).map((p, i) => ({ ...p, id: 'i' + (i + 1) })), mats: schemeMats(job, t.scheme), extras: t.extras ?? [], svc: t.svc,
    site: { house: 'attached', boundary: 1000 },
  }
}
/** The scene a job starts from: its first furnished layout, with no optional extras. */
export const start = (job: Job): Scene => ({ ...fromTemplate(job), extras: [] })

// ------------------------------------------------------------------------------------------ quantities
const r5 = (n: number) => Math.round(n / 5) * 5
const r1 = (n: number) => Math.round(n * 10) / 10
const HERRING = ['herringbone', 'parquet']

/** Everything measured off the plan. Lengths in metres, areas in square metres, before waste unless named. */
export function takeoff(s: Scene) {
  const L = s.length / 1000, W = s.width / 1000, H = s.height / 1000, D = (p: Placed) => def(p.kind)
  const area = L * W, perim = 2 * (L + W)
  const openings = s.items.filter((p) => D(p).mount === 'opening')
  const openArea = openings.reduce((t, p) => t + (dims(p)[0] * D(p).h) / 1e6, 0)
  const doorW = openings.filter((p) => D(p).z === 0).reduce((t, p) => t + dims(p)[0] / 1000, 0)
  const wallGross = perim * H
  const tops = s.items.filter((p) => D(p).top)
  const worktop = tops.reduce((t, p) => t + (dims(p)[0] / 1000) * Math.max(1, Math.round(dims(p)[1] / 600)), 0)
  const backed = tops.filter((p) => wallOf(s, p)).reduce((t, p) => t + dims(p)[0] / 1000, 0)   // worktop that meets a wall
  const fronts = s.items.filter((p) => D(p).front).reduce((t, p) => t + Math.ceil(dims(p)[0] / 600) * (D(p).tall ? 2 : 1), 0)
  const wetItems = s.items.filter((p) => D(p).wet)
  const wet = wetItems.reduce((t, p) => t + (wallOf(s, p) ? ((dims(p)[0] + dims(p)[1]) / 1000) * 2.1 : 0), 0)
  const splash = s.job === 'bathroom' ? 0 : backed * 0.6
  const tile = s.job === 'bathroom' ? (s.extras.includes('fulltile') ? Math.max(0, wallGross - openArea) : Math.min(wet, wallGross - openArea)) : splash
  const paint = Math.max(0, wallGross - openArea - tile) + area
  const water = s.items.filter((p) => D(p).water).length, elec = s.items.filter((p) => D(p).elec).length
  const glazed = s.items.filter((p) => D(p).glazed)
  const glazingM = glazed.filter((p) => D(p).mount === 'opening').reduce((t, p) => t + dims(p)[0] / 1000, 0)
  const glazingArea = glazed.reduce((t, p) => t + (dims(p)[0] * (D(p).mount === 'opening' ? D(p).h : dims(p)[1])) / 1e6, 0)
  const floorWaste = HERRING.includes(mat(s.mats.floor).pattern) ? 0.15 : 0.1
  const sink = s.items.find((p) => p.kind === 'sink')
  const wasteRun = s.job === 'kitchen' && sink ? Math.max(0, pipeRun(s, sink) - WASTE_FREE) / 1000 : 0
  const soilRun = s.job === 'bathroom' ? s.items.filter((p) => D(p).water === 'soil').reduce((t, p) => t + Math.max(0, pipeRun(s, p) - SOIL_FREE) / 1000, 0) : 0
  return {
    L, W, H, area, perim, wallGross, openArea, doorW, worktop, backed, fronts, wet, splash, tile, paint, water, elec, glazingM, glazingArea, floorWaste, wasteRun, soilRun,
    skirting: Math.max(0, perim - doorW - (s.job === 'bathroom' ? perim : backed)),
    litres: Math.ceil((paint * 2) / 12), fittings: (s.job === 'extension' ? 0 : fronts) + water,
    cooker: s.items.some((p) => D(p).cooks || p.kind === 'oven'), knockM: s.items.filter((p) => p.kind === 'knock').reduce((t, p) => t + dims(p)[0] / 1000, 0),
  }
}

// ------------------------------------------------------------------------------------------ the price book
export type Line = { group: string; label: string; qty?: string; total: number }
export const RATES = {
  contingency: 0.05, vat: 0.2,
  shell: [1500, 1800, 2200] as [number, number, number],   // rear extension shell, per m2 of floor
  shellSplit: [['Groundworks and foundations', 0.22], ['Walls and insulation', 0.24], ['Flat warm roof', 0.18], ['First fix electrics and plumbing', 0.12], ['Plastering', 0.09], ['Second fix and joinery', 0.09], ['Site setup, scaffold and waste', 0.06]] as [string, number][],
  tanking: 28, skim: 38, skip: 320, wastePerM: 95, soilPerM: 140, engineer: 850, buildingControl: 780, drainSurvey: 650,
}

/** What one placed item costs at a tier. Wider sizes cost more, per-metre items are priced by their width. */
export function itemPrice(p: Placed, tier: Finish): number {
  const d = def(p.kind), [w, dp] = dims(p), base = d.price[TIER[tier]]
  if (d.free) return 0
  if (d.per === 'm') return r5((base * w) / 1000)
  return r5(base * (0.55 + (0.45 * (w * dp)) / (d.w * d.d)))
}

const extraPrice = (s: Scene, e: [string, string, number, number?], area: number) => r5(e[2] + (e[3] ?? 0) * area)

/** The priced quote for a scene at a tier: every line traces back to something on the plan or a rate in the price book. */
export function quote(s: Scene, tier: Finish = 'better') {
  const q = takeoff(s), lines: Line[] = [], D = (p: Placed) => def(p.kind), M = (slot: Slot) => mat(s.mats[slot])
  const add = (group: string, label: string, total: number, qty?: string) => { if (total > 0) lines.push({ group, label, qty, total: r5(total) }) }
  const m2 = (v: number) => `${r1(v)} m²`

  if (s.job === 'extension') {
    for (const [name, share] of RATES.shellSplit) add('Structure', name, q.area * RATES.shell[TIER[tier]] * share, m2(q.area))
    add('Fees', 'Building Regulations application and inspections', RATES.buildingControl)
    if (q.knockM) add('Fees', 'Structural engineer, steel calculations', RATES.engineer)
    if (s.items.some((p) => p.kind === 'manhole')) add('Fees', 'Drain survey and build-over application, allowance', RATES.drainSurvey)
  } else {
    add('Strip out and prep', s.job === 'kitchen' ? 'Strip out the old kitchen and make good' : 'Strip out the old bathroom and make good', (s.job === 'kitchen' ? 450 + 38 * q.area : 380 + 45 * q.area), m2(q.area))
    add('Plumbing', 'Plumbing, first and second fix', q.water * (s.job === 'kitchen' ? 180 : 210), `${q.water} points`)
    if (q.wasteRun) add('Plumbing', 'Extend the sink waste to the drain', q.wasteRun * RATES.wastePerM, `${r1(q.wasteRun)} m`)
    if (q.soilRun) add('Plumbing', 'New soil run to the stack', q.soilRun * RATES.soilPerM, `${r1(q.soilRun)} m`)
    add('Electrics', 'Electrics, test and certificate', (s.job === 'kitchen' ? 320 : 280) + q.elec * 140, `${q.elec} points`)
    if (s.job === 'kitchen' && q.cooker) add('Electrics', 'New cooker circuit', 260)
    add('Plastering', s.job === 'kitchen' ? 'Skim the ceiling and patch the walls' : 'Board and skim, ready for tiles and paint', q.area * RATES.skim, m2(q.area))
    if (s.job === 'bathroom' && q.wet) add('Tiling and floors', 'Tanking behind the bath and shower', q.wet * RATES.tanking, m2(q.wet))
    add('Waste and site', 'Skips and site protection', RATES.skip * Math.max(1, Math.ceil(q.area / 12)))
  }

  // the things on the plan, grouped by kind
  const byKind = new Map<string, { n: number; total: number; group: string; name: string; w: number }>()
  for (const p of s.items) {
    const d = D(p); if (d.free) continue
    const k = byKind.get(p.kind) ?? { n: 0, total: 0, group: d.group, name: d.name, w: 0 }
    k.n++; k.total += itemPrice(p, tier); k.w += dims(p)[0] / 1000; byKind.set(p.kind, k)
  }
  for (const [kind, k] of byKind) add(k.group, k.name, k.total, def(kind).per === 'm' ? `${r1(k.w)} m` : `${k.n} no.`)

  // finishes, measured off the plan with waste
  const slots = slotsFor(s)
  if (slots.includes('worktop') && q.worktop) add('Worktops', `${M('worktop').name} worktop`, q.worktop * M('worktop').price, `${r1(q.worktop)} m`)
  if (slots.includes('fronts') && q.fronts) add('Units', `${M('fronts').name} fronts`, q.fronts * M('fronts').price, `${q.fronts} fronts`)
  if (slots.includes('tile') && q.tile) add('Tiling and floors', `${M('tile').name} wall tiles`, q.tile * 1.1 * M('tile').price, m2(q.tile * 1.1))
  add('Tiling and floors', `${M('floor').name} floor`, q.area * (1 + q.floorWaste) * M('floor').price, m2(q.area * (1 + q.floorWaste)))
  add('Decoration', `${M('walls').name}, two coats to walls and ceiling`, q.paint * M('walls').price, m2(q.paint))
  if (s.job === 'extension') add('Glazing and doors', M('metal').name, q.glazingM * M('metal').price, `${r1(q.glazingM)} m`)
  else add(s.job === 'kitchen' ? 'Units' : 'Sanitaryware', `${M('metal').name} ${s.job === 'kitchen' ? 'tap and handles' : 'brassware'}`, q.fittings * M('metal').price, `${q.fittings} fittings`)

  const extras: Line[] = JOBS[s.job].extras.filter((e) => s.extras.includes(e[0]))
    .map((e) => ({ group: 'Extras', label: e[1], total: e[0] === 'fulltile' ? 0 : extraPrice(s, e, q.area) }))
  const sum = [...lines, ...extras].reduce((t, l) => t + l.total, 0)
  const contingency = r5(sum * RATES.contingency), net = sum + contingency, vat = Math.round(net * RATES.vat)
  return { area: r1(q.area), lines, extras, contingency, net, vat, total: net + vat }
}

/** Group quote lines the way the customer reads them, in the order they first appear. */
export function grouped(lines: Line[]): { group: string; total: number; lines: Line[] }[] {
  const out: { group: string; total: number; lines: Line[] }[] = []
  for (const l of lines) { let g = out.find((x) => x.group === l.group); if (!g) { g = { group: l.group, total: 0, lines: [] }; out.push(g) } g.lines.push(l); g.total += l.total }
  return out
}

// ------------------------------------------------------------------------------------------ good, better, best
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) }
/** The nearest material in the same slot at another tier, keeping the light or dark character of the choice. */
export function retier(job: Job, slot: Slot, id: string, tier: 0 | 1 | 2): string {
  const cur = mat(id), c = choices(job, slot).filter((x) => x.tier === tier)
  if (cur.tier === tier || !c.length) return id
  return c.reduce((a, b) => (Math.abs(lum(b.hex) - lum(cur.hex)) < Math.abs(lum(a.hex) - lum(cur.hex)) ? b : a)).id
}

/** The scene as it would be built at a tier, and what changes from the customer's own drawing. Content, not a multiplier. */
export function variant(s: Scene, tier: Finish): { scene: Scene; diffs: string[] } {
  const diffs: string[] = [], mats = { ...s.mats }
  let extras = s.extras
  const name = (slot: Slot) => low(SLOT[slot].name[s.job])
  if (tier === 'good') {
    diffs.push('Trade range units, appliances and fittings')
    for (const slot of slotsFor(s)) if (mat(s.mats[slot]).tier > 0) { mats[slot] = retier(s.job, slot, s.mats[slot], 0); if (mats[slot] !== s.mats[slot]) diffs.push(`${mat(mats[slot]).name} ${name(slot)} in place of ${mat(s.mats[slot]).name}`) }
    for (const e of JOBS[s.job].extras) if (extras.includes(e[0]) && LUX.includes(e[0])) { extras = extras.filter((k) => k !== e[0]); diffs.push(`Without ${low(e[1])}`) }
    diffs.push('Two year workmanship guarantee')
  } else if (tier === 'better') {
    diffs.push('Mid range units, appliances and fittings', 'Every finish exactly as you chose it', 'Two year workmanship guarantee')
  } else {
    diffs.push('Top range units, appliances and fittings')
    for (const slot of slotsFor(s)) if (mat(s.mats[slot]).tier < 2) { mats[slot] = retier(s.job, slot, s.mats[slot], 2); if (mats[slot] !== s.mats[slot]) diffs.push(`${mat(mats[slot]).name} ${name(slot)} in place of ${mat(s.mats[slot]).name}`) }
    for (const k of BEST_ADDS[s.job]) if (!extras.includes(k)) { extras = [...extras, k]; diffs.push(`Adds ${low(JOBS[s.job].extras.find((e) => e[0] === k)![1])}`) }
    diffs.push('Ten year workmanship guarantee')
  }
  return { scene: { ...s, mats, extras }, diffs }
}

export const options = (s: Scene) => FINISHES.map(([key, name, what]) => { const v = variant(s, key); return { key, name, what, ...v, ...quote(v.scene, key) } })
export type Option = ReturnType<typeof options>[number]
