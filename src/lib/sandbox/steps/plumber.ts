// Journey steps for the plumber walk-through. Owned by that tool: edit freely, keep the Step shape.
// Two tools on one firm. PLUMBER_STEPS is the boiler fault finder (the sandbox home page counts it);
// HEATING_STEPS is the heating planner. Every automated moment is a step with an artefact in the journal.
import type { Step } from '../journey'

export const PLUMBER_STEPS: Step[] = [
  { id: 'p1', stage: 1, when: 'At once', title: 'Boiler found in the catalogue', detail: 'Make, model and age are matched against the firm\'s own catalogue of boilers, codes and parts.', kind: 'code', lever: 'ticket', ai: 'Read the make and model from a photo of the data plate, so the customer types nothing.' },
  { id: 'p2', stage: 2, when: 'At once', title: 'Fault code looked up', detail: 'The code on the display is matched to its meaning, its most likely cause and the part that fixes it.', kind: 'code', lever: 'cost' },
  { id: 'p3', stage: 2, when: 'At once', title: 'Safe first check offered', detail: 'Where the customer can safely clear the fault themselves, they are shown how. No call-out for a top-up.', kind: 'code', lever: 'ticket', ai: 'Talk the customer through the check and answer their questions as they go.' },
  { id: 'p4', stage: 2, when: 'At once', title: 'Gas safety line shown', detail: 'Every ignition and gas fault carries the emergency number before anything else. Nothing asks the customer to open the case.', kind: 'code', lever: 'ticket' },
  { id: 'p5', stage: 3, when: 'At once', title: 'Repair or replace sum', detail: 'Age times repair price is set against a new boiler. The customer sees the sum and decides. The repair goes ahead either way.', kind: 'code', lever: 'ticket' },
  { id: 'p6', stage: 3, when: 'At once', title: 'Part matched and stock checked', detail: 'The exact part for this model is checked on the van, at the trade counter and with the supplier.', kind: 'code', lever: 'cost' },
  { id: 'p7', stage: 3, when: 'At once', title: 'Part reserved or ordered', detail: 'If it is not in stock a purchase order goes to the supplier. Nobody picks up a phone.', kind: 'code', lever: 'cost' },
  { id: 'p8', stage: 3, when: 'At once', title: 'Fixed price and slots built round the part', detail: 'The customer only sees slots when the part will be there. One visit, not two.', kind: 'code', lever: 'customers' },
  { id: 'p9', stage: 4, when: 'On booking', title: 'Job card sent to the engineer', detail: 'Boiler, code, likely cause, what else to check, part and price, on their phone before they set off.', kind: 'code', lever: 'cost' },
  { id: 'p10', stage: 4, when: 'On booking', title: 'Confirmation text to the customer', detail: 'Slot, engineer, fixed price and what to do until then.', kind: 'code', lever: 'customers' },
  { id: 'p11', stage: 5, when: 'On the day', title: 'Engineer fits the part', detail: 'The step that needs a person: a Gas Safe engineer, with the right part in hand.', kind: 'person', lever: 'cost' },
  { id: 'p12', stage: 5, when: 'Job done', title: 'Invoice and payment link', detail: 'Raised from the job card when the engineer marks it done.', kind: 'code', lever: 'cost' },
  { id: 'p13', stage: 5, when: 'Job done', title: 'Boiler passport updated', detail: 'Make, model, age, the part fitted and the next service date go onto the boiler\'s own record.', kind: 'code', lever: 'customers' },
  { id: 'p14', stage: 5, when: 'Next day', title: 'Review request', detail: 'Sent once, only when the job closed without a complaint.', kind: 'code', lever: 'customers', ai: 'Draft a reply to each review for the owner to approve.' },
  { id: 'p15', stage: 5, when: 'Month 11', title: 'Service reminder', detail: 'The passport holds the date, so the annual service offers its own slots a year on.', kind: 'code', lever: 'customers' },
]

export const HEATING_STEPS: Step[] = [
  { id: 'h1', stage: 1, when: 'At once', title: 'Enquiry logged', detail: 'House type, age and what the customer wants go straight onto the firm\'s board. Nobody retypes a voicemail.', kind: 'code', lever: 'cost' },
  { id: 'h2', stage: 1, when: 'At once', title: 'Planner link sent', detail: 'The customer gets their own link, so they can finish the plan tonight on a phone.', kind: 'code', lever: 'customers', ai: 'Read a photo of an estate agent\'s floor plan into rooms, so the customer starts from their real layout.' },
  { id: 'h3', stage: 2, when: 'At once', title: 'Heat loss calculated', detail: 'Room by room: walls, windows, roof, floor and fresh air, at the coldest design day. The sum an engineer would do on paper.', kind: 'code', lever: 'ticket' },
  { id: 'h4', stage: 3, when: 'At once', title: 'Radiator schedule built', detail: 'Each radiator is checked against its room at the chosen flow temperature and a size is suggested where it falls short.', kind: 'code', lever: 'ticket' },
  { id: 'h5', stage: 4, when: 'At once', title: 'Boiler sized', detail: 'Heat loss and hot water demand decide combi or system and the output. No guessing a size from the old boiler.', kind: 'code', lever: 'ticket' },
  { id: 'h6', stage: 4, when: 'At once', title: 'Three options priced from the price book', detail: 'Every line comes from the firm\'s own price book, so the quote is the same whoever is in the office.', kind: 'code', lever: 'cost' },
  { id: 'h7', stage: 4, when: 'At once', title: 'Grant line checked', detail: 'The heat pump page carries the current grant amount and the date it was checked. Eligibility is confirmed at survey.', kind: 'code', lever: 'ticket' },
  { id: 'h8', stage: 4, when: 'At once', title: 'Data sheet sent to customer and engineer', detail: 'One document, two readers: the customer keeps the plan, the engineer walks in knowing the house.', kind: 'code', lever: 'customers', ai: 'Draft the covering note in the owner\'s voice, for them to approve.' },
  { id: 'h9', stage: 5, when: 'At once', title: 'Survey slots from the diary', detail: 'Only real gaps in the surveyor\'s diary are offered, sized to the house.', kind: 'code', lever: 'cost' },
  { id: 'h10', stage: 5, when: 'On booking', title: 'Survey booked both ways', detail: 'A diary entry for the surveyor and a confirmation for the customer, with what to have ready.', kind: 'code', lever: 'customers' },
  { id: 'h11', stage: 5, when: 'Survey day', title: 'Survey', detail: 'The step that needs a person: measurements, flue route and gas supply are confirmed against the plan.', kind: 'person', lever: 'ticket', ai: 'Turn the surveyor\'s voice notes into changes on the data sheet.' },
  { id: 'h12', stage: 5, when: 'Day 3 and day 7', title: 'Follow-ups', detail: 'Two short messages if the quote has not been accepted. They stop the moment it is.', kind: 'code', lever: 'customers' },
  { id: 'h13', stage: 5, when: 'On acceptance', title: 'Install booked, parts ordered', detail: 'Acceptance books the fitting days, raises the materials order and sets the first service date.', kind: 'code', lever: 'cost' },
]
