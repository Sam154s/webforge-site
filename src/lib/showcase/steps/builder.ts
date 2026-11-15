// Journey steps for the builder walk-through. Owned by that tool: edit freely, keep the Step shape.
// Every automated moment in the room planner is a step here, and each one carries an artefact in the journal.
import type { Step } from '../journey'

export const BUILDER_STAGES = ['Enquiry', 'Planner', 'Job pack', 'Visit booked', 'Follow-up']

export const BUILDER_STEPS: Step[] = [
  { id: 'b1', stage: 1, when: 'At once', title: 'Enquiry logged on the job board', detail: 'Job type, name and postcode area go straight on the board. Nobody types it in.', kind: 'code', lever: 'cost' },
  { id: 'b2', stage: 1, when: 'At once', title: 'Planner link sent', detail: 'An email and a text with the customer\'s own planner, while the job is fresh in their mind.', kind: 'code', lever: 'customers' },
  { id: 'b3', stage: 2, when: 'On open', title: 'Planner opens on a furnished layout', detail: 'The job type picks the fittings list, the price book and three starting layouts. The customer edits a good plan, never an empty room.', kind: 'code', lever: 'ticket', ai: 'Read the room size, the door and the window from a photo or a hand sketch, and start the plan from that.' },
  { id: 'b4', stage: 2, when: 'Every move', title: 'Plan captured, checked and priced', detail: 'Each drag is saved as data, run past the design rules and re-priced. The builder never re-keys a drawing.', kind: 'code', lever: 'ticket' },
  { id: 'b5', stage: 3, when: 'On send', title: 'Drawings built', detail: 'Plan, four wall elevations, a model and a finishes board, numbered and titled like an architect\'s set.', kind: 'code', lever: 'ticket' },
  { id: 'b6', stage: 3, when: 'On send', title: 'Quantities taken off the plan', detail: 'Areas, lengths and counts measured from the drawing, with waste allowances. This is an evening\'s work by hand.', kind: 'code', lever: 'cost' },
  { id: 'b7', stage: 3, when: 'On send', title: 'Three options priced from the price book', detail: 'Good, better and best differ by what is in them, and the pack says exactly what changes.', kind: 'code', lever: 'ticket' },
  { id: 'b8', stage: 3, when: 'On send', title: 'Regulations and planning check run', detail: 'A rule check over the plan flags what is clear, what to check and what the firm arranges. A guide, confirmed on site.', kind: 'code', lever: 'ticket', ai: 'Answer "why is this needed" on any flag in plain English, from wording the builder has approved.' },
  { id: 'b9', stage: 3, when: 'On send', title: 'Pack sent to customer and builder', detail: 'The builder sees the whole job before the visit. No wasted trips to jobs that were never going to fit.', kind: 'code', lever: 'cost', ai: 'Draft the covering email in the builder\'s own voice and tidy the customer\'s notes into scope clauses.' },
  { id: 'b10', stage: 3, when: 'On send', title: 'Visit slots read from the diary', detail: 'Free slots come from the builder\'s diary, grouped by area to save driving.', kind: 'code', lever: 'cost' },
  { id: 'b11', stage: 4, when: 'On booking', title: 'Visit booked', detail: 'In both diaries with the pack attached, and a reminder text the day before.', kind: 'code', lever: 'cost' },
  { id: 'b12', stage: 5, when: 'Visit day', title: 'Builder visits and confirms the price', detail: 'A person checks the sizes against the plan and firms up the figure on site, working from a checklist the pack wrote.', kind: 'person', lever: 'ticket' },
  { id: 'b13', stage: 5, when: 'Day 3', title: 'Follow-up if the pack is not accepted', detail: 'A short nudge with the three options again.', kind: 'code', lever: 'customers', ai: 'Answer the customer\'s questions about the pack, with the builder approving each reply.' },
  { id: 'b14', stage: 5, when: 'Day 8', title: 'Second follow-up, then stop', detail: 'One more, then the job is marked quiet. Nobody is chased for ever.', kind: 'code', lever: 'customers' },
  { id: 'b15', stage: 5, when: 'On accept', title: 'Deposit taken, stage invoices lined up', detail: 'Acceptance raises the deposit invoice, sets the start date and schedules each stage invoice against its milestone.', kind: 'code', lever: 'cost' },
]
