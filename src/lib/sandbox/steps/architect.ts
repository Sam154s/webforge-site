// Journey steps for the architect walk-through. Owned by that tool: edit freely, keep the Step shape.
// Every automated moment is its own step and carries a concrete artefact in the journal (see architect/demo.tsx).
import type { Step } from '../journey'

export const ARCHITECT_STEPS: Step[] = [
  { id: 'a1', stage: 1, when: 'At once', title: 'Enquiry logged', detail: 'The website form writes straight into the practice enquiry list, with the kind of project. Nobody retypes it.', kind: 'code', lever: 'cost' },
  { id: 'a2', stage: 1, when: 'At once', title: 'Designer link sent', detail: 'The customer gets their own link to the 3D designer while they are still on the website, already set up for a new home or an extension.', kind: 'code', lever: 'customers' },
  { id: 'a3', stage: 2, when: 'Same visit', title: 'Design captured as they shape it', detail: 'Blocks dragged on a plan, storeys, roofs and features. Every change is saved, measured and priced, and the practice can watch it take shape.', kind: 'code', lever: 'ticket' },
  { id: 'a4', stage: 3, when: 'On send', title: 'Sheet set drawn', detail: 'A cover and six numbered sheets: model, site plan, floor plans, four elevations, a section, an exploded view and a sun study. All drawn from the model, with title blocks.', kind: 'code', lever: 'ticket' },
  { id: 'a5', stage: 3, when: 'On send', title: 'Permitted development guide run', detail: 'The design is measured against the householder limits and the likely planning route is named. Anything over a limit is marked in red on the model.', kind: 'code', lever: 'ticket', ai: 'Draft a plain English design and access statement from the same facts for the architect to edit.' },
  { id: 'a6', stage: 3, when: 'On send', title: 'Area schedule and cost plan built', detail: 'Floor area by level from the model grid, then a build budget by element. Each feature the customer added shows as its own line.', kind: 'code', lever: 'ticket' },
  { id: 'a7', stage: 3, when: 'On send', title: 'Fee proposal priced from the rate card', detail: 'The fee is worked out from the build budget and the practice fee bands, split across the work stages with a programme.', kind: 'code', lever: 'cost' },
  { id: 'a8', stage: 3, when: 'On send', title: 'Sent to customer and architect', detail: 'Both get the same set. The architect also gets a one page brief with the flags, so the first call starts on the design.', kind: 'code', lever: 'cost', ai: 'Write a personal covering note on the brief in the architect\'s own voice.' },
  { id: 'a9', stage: 3, when: 'On send', title: 'Call slots read from the diary', detail: 'Free slots are read from the architect\'s diary and offered to the customer on the same page.', kind: 'code', lever: 'customers' },
  { id: 'a10', stage: 4, when: 'On booking', title: 'Call booked in both diaries', detail: 'One tap by the customer. The invite carries the sheet set and the brief.', kind: 'code', lever: 'cost' },
  { id: 'a11', stage: 5, when: 'Day before', title: 'Reminder sent', detail: 'A short text the day before so the call happens.', kind: 'code', lever: 'customers' },
  { id: 'a12', stage: 5, when: 'Call day', title: 'Architect takes the call', detail: 'The one step that needs a person. Twenty minutes on the design and the budget, not on fact finding.', kind: 'person', lever: 'ticket' },
  { id: 'a13', stage: 5, when: 'Day 2', title: 'Follow-up if the proposal is unopened', detail: 'Sent only if the customer has not opened or accepted the proposal.', kind: 'code', lever: 'customers', ai: 'Read the customer\'s reply and draft an answer for the architect to approve.' },
  { id: 'a14', stage: 5, when: 'Day 6', title: 'Second follow-up, then stop', detail: 'One more nudge with the sheet set attached. After that the enquiry is marked quiet.', kind: 'code', lever: 'customers' },
  { id: 'a15', stage: 5, when: 'On accept', title: 'Proposal accepted online', detail: 'The customer accepts on the page. The appointment is recorded with the date and the figures they agreed to.', kind: 'code', lever: 'cost' },
  { id: 'a16', stage: 5, when: 'On accept', title: 'Project opened', detail: 'The project file is created with the sheet set inside, the first invoice is raised and the measured survey is requested.', kind: 'code', lever: 'cost' },
]
