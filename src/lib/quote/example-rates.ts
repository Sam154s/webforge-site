import type { Rates } from "./price";

// Example figures to start from. They match the rate sheet of the made-up shop in our gym
// (Corvane Precision, wf-factory/fde/gym/case-02-drawing-to-quote/firm/rate_sheet.json), which the parity check proves against.
// A shop changes them to its own on the page, and its figures stay in its browser.
export const EXAMPLE_RATES: Rates = {
  "machines_per_hour": {
    "lathe": 55.0,
    "vmc": 62.0,
    "bench": 38.0,
    "cmm": 60.0
  },
  "setup_minutes": {
    "lathe": 45,
    "vmc_per_setup": 60,
    "milled_setups": 2,
    "vmc_secondary_for_cross_holes": 30
  },
  "materials": {
    "6082-T6": {
      "name": "Aluminium 6082-T6",
      "density_g_cc": 2.7,
      "per_kg": 6.8,
      "factor": 0.7
    },
    "230M07": {
      "name": "Free cutting steel 230M07 (EN1A)",
      "density_g_cc": 7.85,
      "per_kg": 2.9,
      "factor": 1.0
    },
    "EN24T": {
      "name": "Alloy steel EN24T (817M40)",
      "density_g_cc": 7.85,
      "per_kg": 4.6,
      "factor": 1.3
    },
    "303": {
      "name": "Stainless steel 303",
      "density_g_cc": 8.0,
      "per_kg": 9.5,
      "factor": 1.4
    },
    "316L": {
      "name": "Stainless steel 316L",
      "density_g_cc": 8.0,
      "per_kg": 11.2,
      "factor": 1.6
    },
    "CZ121": {
      "name": "Brass CZ121",
      "density_g_cc": 8.5,
      "per_kg": 8.9,
      "factor": 0.8
    },
    "POM-C": {
      "name": "Acetal copolymer (POM-C)",
      "density_g_cc": 1.41,
      "per_kg": 14.0,
      "factor": 0.7
    }
  },
  "stock": {
    "bar_diameters_mm": [
      6,
      8,
      10,
      12,
      16,
      20,
      22,
      25,
      30,
      32,
      35,
      40,
      45,
      50,
      60,
      63,
      70,
      75,
      80,
      90,
      100
    ],
    "bar_diameter_allowance_mm": 2,
    "bar_length_allowance_mm": 6,
    "plate_thickness_mm": [
      3,
      5,
      6,
      8,
      10,
      12,
      15,
      16,
      20,
      25,
      30,
      35,
      40,
      45,
      50,
      60,
      70,
      80,
      100
    ],
    "plate_side_allowance_mm": 6,
    "plate_thickness_allowance_mm": 2,
    "scrap_allowance": 0.05
  },
  "cycle_minutes": {
    "turned": {
      "load_unload": 0.5,
      "per_face": 0.3,
      "faces": 2,
      "per_diameter": 0.6,
      "per_bore": 1.0,
      "per_ext_thread": 0.8,
      "per_int_thread": 1.0,
      "per_groove": 0.4,
      "part_off": 0.3
    },
    "cross_holes": {
      "load_unload": 0.8,
      "per_hole": 0.5
    },
    "milled": {
      "load_unload_per_setup": 1.0,
      "profile_per_mm_perimeter": 0.01,
      "facing_per_1000_mm2_per_side": 0.05,
      "per_pocket": 3.0,
      "per_through_hole": 0.4,
      "per_tapped_hole": 0.7,
      "per_reamed_hole": 1.0
    }
  },
  "tolerance_factor": [
    {
      "band_at_or_below_mm": 0.02,
      "factor": 1.3
    },
    {
      "band_at_or_below_mm": 0.04,
      "factor": 1.15
    }
  ],
  "bench_minutes_per_part": 0.8,
  "inspection": {
    "first_article_minutes": 30,
    "per_part_minutes": 1.5,
    "sample_share": 0.1,
    "full_inspection_band_at_or_below_mm": 0.02
  },
  "finishes": {
    "none": {
      "name": "No finish",
      "per_part": 0.0,
      "lot_min": 0
    },
    "anodise-clear": {
      "name": "Clear anodise",
      "per_part": 0.9,
      "lot_min": 85
    },
    "hard-anodise-black": {
      "name": "Hard anodise, black",
      "per_part": 2.4,
      "lot_min": 120
    },
    "zinc-nickel": {
      "name": "Zinc nickel plate",
      "per_part": 1.1,
      "lot_min": 95
    },
    "passivate": {
      "name": "Passivate",
      "per_part": 0.6,
      "lot_min": 70
    }
  },
  "bought_out_markup": 0.15,
  "certs": {
    "coc": 15.0,
    "material_3_1": 25.0
  },
  "lead_time_working_days": {
    "base": 10,
    "with_finish": 5,
    "with_material_certs": 3
  },
  "pricing": {
    "target_margin_of_price": 0.22,
    "min_order_value": 150.0
  }
};
