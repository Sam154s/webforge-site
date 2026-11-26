// Real answers: the drawing check run once through Claude (claude-sonnet-5-5) on two drawings from our test set, with the
// example shop setup, by scripts/drawing-check-example.mjs on 26 Nov 2026. Copied as they came back and passed through
// validate(), not edited. The customers and the shop are made up.
import type { Check } from "./schema";

export const EXAMPLES: { id: string; name: string; note: string; check: Check }[] = [
  {
    "id": "08",
    "name": "KI-5521 rev A, guide block",
    "note": "A material the shop doesn’t stock",
    "check": {
      "part": {
        "customer": "Kestrel Instruments Ltd",
        "part_name": "GUIDE BLOCK",
        "drawing_number": "KI-5521",
        "revision": "A",
        "material": "PEEK 450G",
        "finish": "NONE",
        "quantity": "30",
        "size_envelope": "50 x 30 x 20 mm",
        "units": "mm"
      },
      "kind": "milled",
      "special_processes": [],
      "general_tolerance": "Linear ±0.1 (band 0.2 mm), angular ±0.5° (note 2)",
      "tightest_tolerances": [
        {
          "feature": "Distance between the two Ø6 hole centres",
          "callout": "30 ±0.02",
          "band_mm": 0.04,
          "where": "Top view, dimension above the part"
        },
        {
          "feature": "2x Ø6 reamed holes",
          "callout": "Ø6 H7 REAM THRU",
          "band_mm": null,
          "where": "Top view, hole callout"
        }
      ],
      "gdt": {
        "count": 0,
        "types": []
      },
      "surface_finish": [],
      "threads": [
        {
          "spec": "M4x0.7, tap 8 deep",
          "count": 2,
          "where": "Top view, small holes, callout 2x M4x0.7 TAP 8 DEEP"
        }
      ],
      "inspection": [],
      "certificates": [],
      "flow_down_notes": [
        {
          "note": "Remove all sharp edges 0.2 x 45°",
          "where": "Note 3"
        }
      ],
      "against_shop": [
        {
          "kind": "material",
          "item": "PEEK 450G",
          "drawing_says": "Material PEEK 450G",
          "shop_has": "PEEK is not in the stocked materials list",
          "impact": "Material must be bought in. Allow for material cost and lead time.",
          "question": null
        }
      ],
      "missing": [
        {
          "item": "Position of the two Ø6 H7 holes in the 30 mm direction",
          "where": "Top view",
          "why": "Only the spacing between the holes is given, so their position from the part edges is not defined.",
          "question": "Could you please confirm the position of the two Ø6 holes from the edges of the block in the 30 mm direction?"
        },
        {
          "item": "Position of the two M4x0.7 tapped holes",
          "where": "Top view, small holes",
          "why": "No dimensions locate these holes, so the machining set up and checking cannot be quoted reliably.",
          "question": "Could you please give the position dimensions for the two M4x0.7 tapped holes?"
        }
      ]
    }
  },
  {
    "id": "06",
    "name": "TFC-3340 rev B, manifold block",
    "note": "A noisy scan, and a tolerance tighter than the shop holds",
    "check": {
      "part": {
        "customer": "Tolland Fluid Controls Ltd",
        "part_name": "MANIFOLD BLOCK",
        "drawing_number": "TFC-3340",
        "revision": "B",
        "material": "ALUMINIUM ALLOY 6082-T6",
        "finish": "CLEAR ANODISE",
        "quantity": "10",
        "size_envelope": "80 x 50 x 40 mm",
        "units": "mm"
      },
      "kind": "milled",
      "special_processes": [
        {
          "process": "Clear anodise",
          "spec": null,
          "where": "Title block FINISH box and note 6"
        }
      ],
      "general_tolerance": "Linear ±0.1 (band 0.2 mm), angular ±0.5° (note 2)",
      "tightest_tolerances": [
        {
          "feature": "Distance between the two Ø10 holes (centre to centre)",
          "callout": "50 ±0.01",
          "band_mm": 0.02,
          "where": "Top view, dimension above the part"
        },
        {
          "feature": "2x Ø10 reamed holes, through",
          "callout": "Ø10 H7",
          "band_mm": null,
          "where": "Top view, callout 2x Ø10 H7 REAM THRU"
        }
      ],
      "gdt": {
        "count": 0,
        "types": []
      },
      "surface_finish": [],
      "threads": [
        {
          "spec": "M6x1.0, tapped 12 deep",
          "count": 6,
          "where": "Top view, callout 6x M6x1.0 TAP 12 DEEP"
        }
      ],
      "inspection": [],
      "certificates": [
        {
          "requirement": "Material certificates to EN 10204 3.1 required",
          "where": "Note 4"
        },
        {
          "requirement": "Certificate of conformity required with delivery",
          "where": "Note 5"
        }
      ],
      "flow_down_notes": [
        {
          "note": "Remove all sharp edges 0.2 x 45°",
          "where": "Note 3"
        }
      ],
      "against_shop": [
        {
          "kind": "tolerance",
          "item": "Distance between the two Ø10 holes",
          "drawing_says": "50 ±0.01, a band of 0.02 mm",
          "shop_has": "Tightest band held on milled parts is 0.03 mm",
          "impact": "The tolerance is tighter than we hold on milled parts. We may not be able to guarantee it.",
          "question": "Can the 50 ±0.01 hole spacing be opened up to a band of 0.03 mm or wider?"
        },
        {
          "kind": "finish_sent_out",
          "item": "Clear anodise",
          "drawing_says": "CLEAR ANODISE (title block and note 6)",
          "shop_has": "Clear anodise is sent out to a subcontractor",
          "impact": "The quote needs subcontract cost and extra lead time for anodising.",
          "question": null
        }
      ],
      "missing": [
        {
          "item": "Anodise specification",
          "where": "Title block FINISH box and note 6",
          "why": "There is no standard, type or coating thickness, so the subcontractor cannot be priced or told what to apply.",
          "question": "Please can you give the anodising specification, including type and coating thickness?"
        },
        {
          "item": "Hole and pocket positions",
          "where": "Top view",
          "why": "Only the 50 mm spacing of the two Ø10 holes is dimensioned. The six tapped holes and the pocket have no position dimensions, so programming and inspection cannot be quoted with certainty.",
          "question": "Please can you provide the position dimensions for the six M6 holes, the pocket and the two Ø10 holes within the block?"
        },
        {
          "item": "Pocket corner radii",
          "where": "Top view, POCKET 20 x 20 x 10 DEEP",
          "why": "The pocket corners look rounded but no radius is written, which affects the cutter size and machining time.",
          "question": "Please can you confirm the corner radius of the pocket?"
        }
      ]
    }
  }
];
