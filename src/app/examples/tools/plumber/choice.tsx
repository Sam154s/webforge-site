// The two drawings on the entry screen: a corner of the boiler schematic, and a corner of a thermal plan.
import { Balloon, Defs, Dim, Fan, Hex, Pump, Vessel } from './symbols'

export const ChoiceBoiler = () => (
  <svg className="tw-svg pic" viewBox="0 0 320 180" aria-hidden preserveAspectRatio="xMidYMid slice">
    <Defs />
    <rect x="86" y="-10" width="150" height="210" rx="4" className="hv" />
    <path d="M118 104 V190" className="flow draw" pathLength={1} /><path d="M206 104 V190" className="ret" />
    <Vessel x={103} y={60} s={0.7} />
    <Fan x={162} y={24} />
    <Hex x={162} y={76} s={0.92} />
    <Pump x={206} y={140} cls="hot" />
    <path d="M162 108 V190" className="gas" />
    <rect x="98" y="132" width="44" height="20" rx="2" className="screen" /><text x="120" y="147" className="code">F24</text>
    <path className="lead" d="M179 24 L263 24 M218 72 L263 72" /><path className="lead hot" d="M220 140 L262 140" />
    <Balloon x={272} y={24} n={1} /><Balloon x={272} y={72} n={2} /><Balloon x={273} y={140} n={9} state="hot" />
    <path className="lead" d="M92 60 L52 60" /><Balloon x={43} y={60} n={4} />
  </svg>
)

const R: [number, number, number, number, string, string, string][] = [
  [60, 34, 96, 66, '#F2C4A0', 'Living room', '1,209 W'], [156, 34, 48, 66, '#EDA47A', 'Hall', '834 W'], [60, 100, 144, 52, '#EDA47A', 'Kitchen diner', '1,553 W'],
]
export const ChoicePlan = () => (
  <svg className="tw-svg tw-plan pic" viewBox="0 0 320 180" aria-hidden preserveAspectRatio="xMidYMid slice">
    <Defs />
    {R.map(([x, y, w, h, fill, name, watts]) => (
      <g key={name}><rect x={x} y={y} width={w} height={h} fill={fill} stroke="none" /><text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle" className="nm">{name}</text><text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" className="w sm">{watts}</text></g>
    ))}
    <path d="M60 34 V152" className="wall party" /><path d="M60 34 H204 V152 H60" className="wall ext" fill="none" /><path d="M156 34 V100 M60 100 H204" className="wall int" />
    <path d="M90 34 H128 M204 112 V140" className="wgap" /><path d="M90 32.4 H128 M90 35.6 H128 M202.4 112 V140 M205.6 112 V140" className="wline" />
    <rect x="94" y="39" width="30" height="4" className="rad" /><rect x="196" y="116" width="4" height="20" className="rad short" />
    <Dim x1={60} y1={34} x2={204} y2={34} off={-12} label="6 m" /><Dim x1={60} y1={34} x2={60} y2={152} off={-14} label="7.5 m" />
    <g transform="translate(232 44)">
      {['#F6F0E2', '#F5DFC6', '#F2C4A0', '#EDA47A', '#E67F56'].map((c, i) => <rect key={c} x="0" y={i * 15} width="14" height="15" fill={c} className="th" />)}
      <text x="20" y="10" className="sz">Under 40 W/m²</text><text x="20" y="71" className="sz">Over 100</text>
    </g>
    <text x="232" y="140" className="w">6.5 kW</text><text x="232" y="152" className="sz">Design heat loss</text>
  </svg>
)
