(() => {
'use strict';
const __WF_CONFIG__ = {"id":"our-estimator","title":"Webflow Outreach price estimator","steps":[{"id":"what","label":"What do you want fixed?","fields":[{"name":"fix","type":"select","required":true,"label":"I want help with","options":[{"value":"workflow","label":"A repeated back-office task (a workflow)"},{"value":"web_tool","label":"A tool for my customers (a quote form or calculator)"},{"value":"website","label":"A website"},{"value":"diagnostic","label":"I am not sure yet (free diagnostic)"}]}]},{"id":"systems","label":"How many systems are involved?","intro":"Count each place the information lives, such as accounts software, a spreadsheet, email or a CRM.","fields":[{"name":"systems","type":"number","required":true,"label":"Number of systems","hint":"A whole number from 1 to 10.","bounds":{"min":1,"max":10,"integer":true}}]},{"id":"urgency","label":"How soon do you need it?","fields":[{"name":"urgency","type":"select","required":true,"label":"Timing","options":[{"value":"flexible","label":"No rush"},{"value":"soon","label":"Within a few weeks"},{"value":"urgent","label":"As soon as possible"}]}]}],"rules":{"schema":"webforge.rules/v1","assumptions":["Pilot fix 750 to 1,000 pounds, builder 5,000, extra workflow 1,000, extraction 1,500 to 3,000 and support from 1,000 a month are from PLAN.md.","web_tool base 1,500 to 3,000 pounds is NOT in PLAN.md: it reuses the extraction band as a placeholder. Pending Sam.","urgent adds up to 25 percent on the high end only. NOT in PLAN.md. Pending Sam.","Each extra system adds one extra workflow (1,000 pounds). Extraction, builder and support are priced on a call, not here."],"inputs":{"fix":{"type":"select","options":["workflow","web_tool","website","diagnostic"]},"systems":{"type":"number","min":1,"max":10,"integer":true},"urgency":{"type":"select","options":["flexible","soon","urgent"]}},"stops":[{"when":{"input":"fix","op":"==","value":"website"},"reason":"website_needs_scoping"},{"when":[{"input":"fix","op":"!=","value":"diagnostic"},{"input":"systems","op":">","value":3}],"reason":"bigger_than_pilot"}],"base":{"by":"fix","table":{"workflow":{"low":75000,"high":100000},"web_tool":{"low":150000,"high":300000},"website":{"low":0,"high":0},"diagnostic":{"low":0,"high":0}}},"adders":[{"when":{"input":"fix","op":"in","value":["workflow","web_tool"]},"per":"systems","over":1,"low":100000,"high":100000}],"multipliers":[{"when":{"input":"urgency","op":"==","value":"urgent"},"low_pct":100,"high_pct":125}],"rounding":{"step_pence":5000},"buckets":[{"max_high_pence":0,"bucket":"free"},{"max_high_pence":150000,"bucket":"pilot"},{"max_high_pence":500000,"bucket":"project"},{"bucket":"large"}],"monotonic":["systems"]},"copy":{"noscript":"This estimator needs JavaScript. Email hello@webflowoutreach.com and we will give you a range by hand.","error_prefix":"Error:","optional":"(optional)","choose":"Choose one","summary_title":"Please fix these before you carry on","step_of":"Step {n} of {of}","back":"Back","next":"Next","see_estimate":"See my estimate","moved_back":"Moved back one step.","change_answers":"Change my answers","fallback_lead":"Prefer to talk to a person?","fallback_link":"Open this estimator on its own page.","fallback_phone":"Or email","errors":{"required":"Please answer this question.","select":"Choose one of the options.","number":"Enter a whole number.","range":"Enter a number from 1 to 10.","integer":"Enter a whole number.","email":"Enter an email address like name@example.co.uk.","phone":"Enter a UK phone number, or leave it blank.","sensitive":"Please leave out health, bank or ID details."},"result":{"title":"Your estimate","estimate_label":"Estimate only, not a quote","free":"Free","speech":"Your estimate is {range}. This is an estimate only, not a quote.","buckets":{"free":"The diagnostic is free. We look at where your team's time goes and tell you what is worth fixing.","pilot":"This is in the range of a pilot fix: one workflow built, tested against your real examples, and you only pay if it passes.","project":"This is a bigger piece of work than a single pilot. We would agree the scope with you before anything is built.","large":"This is large enough that we would scope it together first. Ongoing support starts from 1,000 pounds a month."},"disclaimer":"We confirm a fixed price after a short call. This range is a guide and is not an offer.","cta":"Ask us about this"},"stop":{"title":"We need to talk","default":"We cannot give a sensible range for this without a conversation.","website_needs_scoping":"Websites depend too much on pages, content and design to price in a form. Tell us what you have in mind and we will come back with a figure.","bigger_than_pilot":"More than three systems is bigger than a pilot fix. It usually means our builder package or ongoing support, and we would price it after a call.","cta":"Book a conversation"},"enquiry":{"title":"Tell us how to reach you","intro":"We will email you straight away to confirm we have your request, and a person replies within one working day.","honeypot":"Leave this empty","privacy_lead":"We use your details only to reply to this request. Read our","privacy_link":"privacy notice","send":"Send my request","sending":"Sending","sent_title":"Thank you, we have your request","sent_body":"A confirmation is on its way to your inbox. If it does not arrive in a few minutes, check your spam folder or email hello@webflowoutreach.com.","send_failed":"Sorry, that did not send. Please try again, or email hello@webflowoutreach.com."}},"brand":{"profile":"client","name":"Set at install from the client's brand sheet","approved_by":null,"logo":{"file":null,"rights_confirmed_by":null},"fonts":{"display":{"family":"Archivo","licence":"OFL","fallback":"Arial, sans-serif"},"body":{"family":"Hanken Grotesk","licence":"OFL","fallback":"Arial, sans-serif"},"mono":{"family":"JetBrains Mono","licence":"OFL","fallback":"Menlo, monospace"}},"color":{"bg":"#E8E6E1","surface":"#F2F1ED","ink":"#111111","ink-muted":"#4A4843","line-strong":"#77746D","accent":"#D9F24A","on-accent":"#111111","accent-ink":"#234BE0","ok":"#1E6B3A","watch":"#8A5A00","act":"#B42318"},"pairs":[["ink","bg",7],["ink","surface",7],["ink-muted","bg",4.5],["ink-muted","surface",4.5],["on-accent","accent",4.5],["accent-ink","bg",4.5],["accent-ink","surface",4.5],["line-strong","bg",3],["ok","bg",4.5],["watch","bg",4.5],["act","bg",4.5]]},"enquiryFields":[{"name":"name","type":"text","required":true,"label":"Your name","bounds":{"max":100}},{"name":"email","type":"email","required":true,"label":"Email address"},{"name":"phone","type":"phone","required":false,"label":"Phone number","hint":"Only if you would like a call."},{"name":"message","type":"text","required":false,"rows":4,"label":"Anything we should know","hint":"Please do not include health, bank or ID details.","bounds":{"max":1000}},{"name":"marketing","type":"consent","required":false,"label":"You may email me about Webflow Outreach services. I can say stop at any time."}],"privacy_url":"https://webflowoutreach.com/privacy","phone":"","hosted_url":"https://estimate.webflowoutreach.com","endpoint":"https://endpoint-not-configured.invalid","turnstile_site_key":""};
/* events.mjs */
// Closed event vocabulary. The widget may send nothing else; the Worker rejects anything else.
// No PII, no persistent id. Only these keys travel with an event.
const EVENTS = ['view', 'start', 'step', 'complete', 'enquiry', 'error']
const EVENT_KEYS = { view: [], start: [], step: ['step'], complete: ['bucket', 'low_pence', 'high_pence'], enquiry: [], error: ['code'] }

function cleanEvent(e) {
  if (!e || typeof e !== 'object' || !EVENTS.includes(e.event)) return null
  const out = { event: e.event }
  for (const k of Object.keys(e)) if (k !== 'event' && !EVENT_KEYS[e.event].includes(k)) return null
  for (const k of EVENT_KEYS[e.event]) {
    if (e[k] === undefined) continue
    if (k === 'bucket' || k === 'code') { if (typeof e[k] !== 'string' || !/^[a-z0-9_]{1,40}$/.test(e[k])) return null }
    else if (!Number.isSafeInteger(e[k]) || e[k] < 0) return null
    out[k] = e[k]
  }
  return out
}

/* form.mjs */
// Field renderer model + validation. Closed field-type whitelist: no file, no special-category types.
const FIELD_TYPES = ['text', 'email', 'phone', 'select', 'number', 'postcode', 'date', 'consent']

const EMAIL = /^[^\s@<>",;:]+@[^\s@<>",;:]+\.[^\s@<>",;:]{2,}$/
const POSTCODE = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/
const normalisePhone = s => {
  let d = String(s).replace(/[\s().-]/g, '')
  if (d.startsWith('+44')) d = '0' + d.slice(3)
  else if (d.startsWith('0044')) d = '0' + d.slice(4)
  return /^0\d{9,10}$/.test(d) ? d : null
}
const normalisePostcode = s => {
  const c = String(s).toUpperCase().replace(/\s+/g, '')
  const out = c.slice(0, -3) + ' ' + c.slice(-3)
  return POSTCODE.test(out) ? out : null
}
// Obvious health or sensitive-data patterns are refused in free text (the kit never stores special-category data).
const SENSITIVE = /\b(diagnos\w+|prescription|nhs number|medical condition|passport number|national insurance|sort code|card number|cvv)\b/i

// Returns { ok, value, error } where error is a short human message (UK English) or a code the copy can map.
function checkField(f, raw, copy = {}) {
  const msg = (k, d) => copy.errors?.[k] ?? d
  const s = typeof raw === 'string' ? raw.trim() : raw
  const empty = s === undefined || s === null || s === '' || s === false
  if (f.type === 'consent') return { ok: true, value: s === true || s === 'on' || s === 'true' }
  if (empty) return f.required ? { ok: false, error: msg('required', 'Please fill this in.') } : { ok: true, value: '' }
  switch (f.type) {
    case 'text': {
      const max = f.bounds?.max ?? 200, min = f.bounds?.min ?? 0
      if (typeof s !== 'string' || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s)) return { ok: false, error: msg('invalid', 'Please check this.') }
      if (s.length < min) return { ok: false, error: msg('too_short', 'That is too short.') }
      if (s.length > max) return { ok: false, error: msg('too_long', `Please keep this under ${max} characters.`) }
      if (SENSITIVE.test(s)) return { ok: false, error: msg('sensitive', 'Please leave out health, bank or ID details.') }
      return { ok: true, value: s }
    }
    case 'email': return typeof s === 'string' && s.length <= 254 && EMAIL.test(s) ? { ok: true, value: s.toLowerCase() } : { ok: false, error: msg('email', 'Enter an email address like name@example.co.uk.') }
    case 'phone': { const p = normalisePhone(s); return p ? { ok: true, value: p } : { ok: false, error: msg('phone', 'Enter a UK phone number.') } }
    case 'postcode': { const p = normalisePostcode(s); return p ? { ok: true, value: p } : { ok: false, error: msg('postcode', 'Enter a UK postcode.') } }
    case 'date': return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) ? { ok: true, value: s } : { ok: false, error: msg('date', 'Enter a date.') }
    case 'select': return (f.options ?? []).some(o => (o.value ?? o) === s) ? { ok: true, value: s } : { ok: false, error: msg('select', 'Choose one of the options.') }
    case 'number': {
      const x = typeof s === 'number' ? s : /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN
      if (!Number.isFinite(x)) return { ok: false, error: msg('number', 'Enter a number.') }
      if (f.bounds && (x < f.bounds.min || x > f.bounds.max)) return { ok: false, error: msg('range', `Enter a number from ${f.bounds.min} to ${f.bounds.max}.`) }
      if (f.bounds?.integer && !Number.isInteger(x)) return { ok: false, error: msg('integer', 'Enter a whole number.') }
      return { ok: true, value: x }
    }
  }
  return { ok: false, error: 'Unsupported field.' }
}

// Validate a list of fields against a values object. Unknown keys are returned so the Worker can reject them.
function checkFields(fields, values, copy) {
  const errors = {}, value = {}
  for (const f of fields) {
    const r = checkField(f, values?.[f.name], copy)
    if (r.ok) value[f.name] = r.value
    else errors[f.name] = r.error
  }
  const unknown = Object.keys(values ?? {}).filter(k => !fields.some(f => f.name === k))
  return { ok: Object.keys(errors).length === 0 && unknown.length === 0, errors, value, unknown }
}

/* pricing.mjs */
// Pricing evaluator. rules.json is DATA written by the AI; this function is ours, closed and pure.
// Money is integer pence. Anything unexpected returns a named stop, never a guessed price.
//
// rules.json shape (webforge.rules/v1):
//   inputs:      { name: { type: "select", options: [..] } | { type: "number", min, max, integer } }
//   stops:       [ { when: Cond, reason } ]               first match wins, checked after input validation
//   base:        { by: inputName, table: { option: { low, high } } }
//   adders:      [ { when?: Cond, per: inputName, over?: n, low, high } ]   adds (value - over) * low/high
//   multipliers: [ { when: Cond, low_pct, high_pct } ]    integer percents, applied after adders
//   rounding:    { step_pence }                           low rounds down, high rounds up
//   buckets:     [ { max_high_pence, bucket } ]           ascending; last one may omit max_high_pence
//   monotonic:   [ inputName ]                            property test: high never falls as these rise
// Cond: { input, op: "==" | "!=" | ">" | ">=" | "<" | "<=" | "in", value }, or an array of Cond that must all hold
const OPS = { '==': (a, b) => a === b, '!=': (a, b) => a !== b, '>': (a, b) => a > b, '>=': (a, b) => a >= b, '<': (a, b) => a < b, '<=': (a, b) => a <= b, in: (a, b) => b.includes(a) }
const isPence = n => Number.isSafeInteger(n) && n >= 0
const stop = (stop_reason, detail) => ({ ok: false, stop_reason, ...(detail ? { detail } : {}) })
const holds = (c, v) => c === undefined || [c].flat().every(x => v[x.input] !== undefined && OPS[x.op](v[x.input], x.value))

function checkRules(r) {
  const p = [], need = (ok, m) => { if (!ok) p.push(m) }
  need(r && r.schema === 'webforge.rules/v1', 'rules.schema must be webforge.rules/v1')
  const inputs = r?.inputs ?? {}
  need(Object.keys(inputs).length > 0, 'rules.inputs are required')
  for (const [k, d] of Object.entries(inputs)) {
    if (d.type === 'select') need(Array.isArray(d.options) && d.options.length > 0 && d.options.every(o => typeof o === 'string'), `rules.inputs.${k}.options must be strings`)
    else if (d.type === 'number') need(Number.isFinite(d.min) && Number.isFinite(d.max) && d.min <= d.max, `rules.inputs.${k} needs min and max`)
    else need(false, `rules.inputs.${k}.type must be select or number`)
  }
  const cond = (c, w) => need(c === undefined || [c].flat().every(x => x.input in inputs && x.op in OPS), `${w}: unknown input or op`)
  need(r?.base?.by in inputs, 'rules.base.by must name an input')
  if (r?.base?.by in inputs) for (const o of inputs[r.base.by].options ?? []) need(isPence(r.base.table?.[o]?.low) && isPence(r.base.table?.[o]?.high) && r.base.table[o].low <= r.base.table[o].high, `rules.base.table.${o} needs integer pence low <= high`)
  for (const s of r?.stops ?? []) { cond(s.when, 'stops'); need(/^[a-z0-9_]+$/.test(s.reason ?? ''), 'stops need a snake_case reason') }
  for (const a of r?.adders ?? []) { cond(a.when, 'adders'); need(a.per in inputs && isPence(a.low) && isPence(a.high), 'adders need per, low, high (integer pence)') }
  for (const m of r?.multipliers ?? []) { cond(m.when, 'multipliers'); need(Number.isInteger(m.low_pct) && Number.isInteger(m.high_pct), 'multipliers use integer percents') }
  need(Number.isInteger(r?.rounding?.step_pence) && r.rounding.step_pence >= 1, 'rules.rounding.step_pence must be an integer >= 1')
  need(Array.isArray(r?.buckets) && r.buckets.length > 0, 'rules.buckets are required')
  return p
}

function normaliseInputs(rules, raw) {
  const v = {}
  for (const [k, d] of Object.entries(rules.inputs)) {
    let x = raw?.[k]
    if (d.type === 'number' && typeof x === 'string' && /^-?\d+(\.\d+)?$/.test(x.trim())) x = Number(x)
    if (x === undefined || x === null || x === '') return stop('missing_input', k)
    if (d.type === 'select') { if (!d.options.includes(x)) return stop('invalid_input', k) }
    else if (typeof x !== 'number' || !Number.isFinite(x) || x < d.min || x > d.max || (d.integer && !Number.isInteger(x))) return stop('invalid_input', k)
    v[k] = x
  }
  return { ok: true, v }
}

function evaluate(rules, raw) {
  const n = normaliseInputs(rules, raw)
  if (!n.ok) return n
  const v = n.v
  for (const s of rules.stops ?? []) if (holds(s.when, v)) return stop(s.reason)
  const b = rules.base.table[v[rules.base.by]]
  let low = b.low, high = b.high
  for (const a of rules.adders ?? []) if (holds(a.when, v)) { const k = Math.max(0, v[a.per] - (a.over ?? 0)); low += k * a.low; high += k * a.high }
  for (const m of rules.multipliers ?? []) if (holds(m.when, v)) { low = Math.round(low * m.low_pct / 100); high = Math.round(high * m.high_pct / 100) }
  const step = rules.rounding.step_pence
  low = Math.floor(low / step) * step; high = Math.ceil(high / step) * step
  if (!isPence(low) || !isPence(high) || low > high) return stop('internal_range_error')
  const bucket = rules.buckets.find(x => x.max_high_pence === undefined || high <= x.max_high_pence)?.bucket
  if (!bucket) return stop('no_bucket')
  return { ok: true, low_pence: low, high_pence: high, bucket }
}

// Every combination of the declared inputs (numbers: min, max and each integer in between up to 12 values, plus one out-of-range).
function edgeInputs(rules) {
  const dom = Object.entries(rules.inputs).map(([k, d]) => [k, d.type === 'select' ? d.options
    : [...new Set([d.min, d.min + 1, Math.floor((d.min + d.max) / 2), d.max - 1, d.max].filter(x => x >= d.min && x <= d.max))].sort((a, b) => a - b)])
  let combos = [{}]
  for (const [k, vals] of dom) combos = combos.flatMap(c => vals.map(x => ({ ...c, [k]: x })))
  return combos
}
const badInputs = rules => {
  const base = Object.fromEntries(Object.entries(rules.inputs).map(([k, d]) => [k, d.type === 'select' ? d.options[0] : d.min]))
  return Object.entries(rules.inputs).flatMap(([k, d]) => [
    { ...base, [k]: undefined }, { ...base, [k]: d.type === 'select' ? 'nope' : d.max + 1 }, { ...base, [k]: NaN }, { ...base, [k]: d.type === 'number' ? d.min + 0.5 : null },
  ])
}

// Golden quotes: [{ name, inputs, expect: {low_pence, high_pence, bucket} | {stop_reason}, signed_by }]
function runGoldens(rules, goldens) {
  const fail = []
  if (!goldens.length) fail.push('no golden quotes')
  const names = new Set()
  for (const g of goldens) {
    if (names.has(g.name)) fail.push(`golden "${g.name}" is duplicated`)
    names.add(g.name)
    if (!g.signed_by) fail.push(`golden "${g.name}" is not signed (signed_by)`)
    const r = evaluate(rules, g.inputs)
    const want = g.expect.stop_reason ? { ok: false, stop_reason: g.expect.stop_reason } : { ok: true, low_pence: g.expect.low_pence, high_pence: g.expect.high_pence, bucket: g.expect.bucket }
    const got = r.ok ? r : { ok: false, stop_reason: r.stop_reason }
    if (JSON.stringify(sortKeys(got)) !== JSON.stringify(sortKeys(want))) fail.push(`golden "${g.name}": expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`)
  }
  return fail
}
const sortKeys = o => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]))

// Property tests over generated inputs: integer pence, low <= high, bounded, bad input stops by name, monotonic where declared.
function runProperties(rules) {
  const fail = []
  const all = edgeInputs(rules).map(i => [i, evaluate(rules, i)])
  for (const [i, r] of all) {
    if (r.ok && !(isPence(r.low_pence) && isPence(r.high_pence) && r.low_pence <= r.high_pence)) fail.push(`bad range for ${JSON.stringify(i)}`)
    if (!r.ok && !r.stop_reason) fail.push(`stop without reason for ${JSON.stringify(i)}`)
  }
  for (const i of badInputs(rules)) { const r = evaluate(rules, i); if (r.ok || !/^(missing|invalid)_input$/.test(r.stop_reason)) fail.push(`bad input did not stop by name: ${JSON.stringify(i)}`) }
  for (const k of rules.monotonic ?? []) {
    const d = rules.inputs[k]
    for (const [i, r] of all) {
      if (d.type !== 'number' || !r.ok || i[k] >= d.max) continue
      const up = evaluate(rules, { ...i, [k]: i[k] + 1 })
      if (up.ok && up.high_pence < r.high_pence) fail.push(`not monotonic in ${k} at ${JSON.stringify(i)}`)
    }
  }
  return fail
}

/* flow.mjs */
// The widget's behaviour as a pure state machine. The shell only renders it, so the journey is testable
// without a browser. No clock, no randomness, no storage.



function createFlow({ steps, rules, copy, enquiryFields }) {
  const s = { phase: 'steps', index: 0, values: {}, errors: {}, result: null, started: false, events: [], enquiry: {}, enquiryErrors: {} }
  const emit = e => s.events.push(e)
  const cur = () => steps[s.index]
  const api = {
    state: s,
    drain() { return s.events.splice(0) },
    view() { emit({ event: 'view' }) },
    set(name, value) {
      if (!s.started) { s.started = true; emit({ event: 'start' }) }
      s.values[name] = value; delete s.errors[name]
    },
    next() {
      if (s.phase !== 'steps') return false
      const r = checkFields(cur().fields, Object.fromEntries(cur().fields.map(f => [f.name, s.values[f.name]])), copy)
      s.errors = r.errors
      if (!r.ok) { emit({ event: 'error', code: 'validation' }); return false }
      Object.assign(s.values, r.value)
      emit({ event: 'step', step: s.index + 1 })
      if (s.index < steps.length - 1) { s.index++; return true }
      const q = evaluate(rules, s.values)
      s.result = q.ok ? q : { ok: false, stop_reason: q.stop_reason }
      s.phase = 'result'
      emit({ event: 'complete', bucket: q.ok ? q.bucket : 'we_need_to_talk', low_pence: q.ok ? q.low_pence : 0, high_pence: q.ok ? q.high_pence : 0 })
      return true
    },
    back() {
      s.errors = {}; s.enquiryErrors = {}
      if (s.phase === 'enquiry') { s.phase = 'result'; return true }
      if (s.phase === 'result') { s.phase = 'steps'; return true }
      if (s.phase === 'steps' && s.index > 0) { s.index--; return true }
      return false
    },
    toEnquiry() { if (s.phase === 'result') { s.phase = 'enquiry'; return true } return false },
    setEnquiry(name, value) { s.enquiry[name] = value; delete s.enquiryErrors[name] },
    // Returns the payload to POST, or null with errors set.
    prepareEnquiry() {
      const r = checkFields(enquiryFields, s.enquiry, copy)
      s.enquiryErrors = r.errors
      if (!r.ok) { emit({ event: 'error', code: 'validation' }); return null }
      return { fields: r.value, result: s.result.ok ? { low_pence: s.result.low_pence, high_pence: s.result.high_pence, bucket: s.result.bucket } : { stop_reason: s.result.stop_reason }, inputs: { ...s.values } }
    },
    sent() { s.phase = 'done'; emit({ event: 'enquiry' }) },
    failed(code) { emit({ event: 'error', code }) },
    progress() { return s.phase === 'steps' ? { n: s.index + 1, of: steps.length } : null },
  }
  return api
}

const poundsFromPence = p => '£' + (p / 100).toLocaleString('en-GB', { minimumFractionDigits: p % 100 ? 2 : 0, maximumFractionDigits: 2 })
const rangeText = (r, copy) => r.low_pence === r.high_pence
  ? (r.high_pence === 0 ? copy.result.free : poundsFromPence(r.low_pence))
  : `${poundsFromPence(r.low_pence)} to ${poundsFromPence(r.high_pence)}`

/* tokens.mjs */
// brand.json -> CSS custom properties. The only place colour and font values enter the widget.
function brandCss(brand) {
  const c = brand.color, f = brand.fonts
  const stack = x => `"${x.family}", ${x.fallback}`
  const vars = Object.entries(c).map(([k, v]) => `--wf-${k}: ${v};`).join('\n  ')
  return `:host {\n  ${vars}\n  --wf-font-display: ${stack(f.display)};\n  --wf-font-body: ${stack(f.body)};\n  --wf-font-mono: ${stack(f.mono)};\n  --wf-radius-1: 4px;\n  --wf-radius-2: 8px;\n}`
}

/* shell.js */
// Widget shell: <wf-tool>, one custom element with a Shadow DOM. Ours, closed, tested once per kit release.
// The build (wf build-widget) strips the import/export lines below, prepends __WF_CONFIG__ and wraps this in an IIFE.
// Rules: nothing is stored on the visitor's device, no third-party request except Turnstile, all text is set as text (never parsed as markup).




const CFG = __WF_CONFIG__
const { copy, brand } = CFG

const CSS = `
*,*::before,*::after{box-sizing:border-box}
:host{display:block}
/* all:initial first: the host page's inherited text styles (letter-spacing, font-style, white-space and so on) must not reach the widget.
   Sizes are em from font-size:medium (the visitor's own default), never rem: html{font-size:62.5%} on the host must not shrink the widget. */
.wf{all:initial;box-sizing:border-box;display:block;font-family:var(--wf-font-body);font-size:medium;line-height:1.5;color:var(--wf-ink);background:var(--wf-surface);border:1px solid var(--wf-line-strong);border-radius:var(--wf-radius-2);padding:1.25em;max-width:40em;margin:0 auto;text-align:left}
h2,.wf h2{font-family:var(--wf-font-display);font-size:1.5em;line-height:1.2;margin:0 0 .75em;font-weight:700;scroll-margin:6em 0}
h2:focus{outline:none}
.wf p{margin:0 0 .75em}
.muted{color:var(--wf-ink-muted)}
.stepno{font-family:var(--wf-font-mono);font-size:.875em;color:var(--wf-ink-muted);margin:0 0 .25em}
.field{margin:0 0 1em;border:0;padding:0;min-width:0}
label,legend{display:block;font-weight:600;margin:0 0 .25em;padding:0}
.hint{display:block;color:var(--wf-ink-muted);font-size:.9375em;margin:0 0 .375em}
input[type=text],input[type=email],input[type=tel],input[type=date],select,textarea{display:block;width:100%;min-height:2.75em;font:inherit;color:var(--wf-ink);background:var(--wf-bg);border:2px solid var(--wf-ink);border-radius:var(--wf-radius-1);padding:.5em .75em}
input[aria-invalid=true],select[aria-invalid=true]{border-color:var(--wf-act)}
.opt{display:flex;align-items:center;gap:.75em;min-height:2.75em;padding:.5em .75em;margin:0 0 .5em;border:2px solid var(--wf-ink);border-radius:var(--wf-radius-1);background:var(--wf-bg);font-weight:400;cursor:pointer}
.opt:has(input:checked){background:var(--wf-accent);color:var(--wf-on-accent);font-weight:600}
.opt input{font:inherit;width:1.5em;height:1.5em;margin:0;flex:none;accent-color:var(--wf-ink)}
.err{color:var(--wf-act);font-weight:600;margin:.25em 0 0}
.summary{border:2px solid var(--wf-act);border-radius:var(--wf-radius-1);padding:.75em;margin:0 0 1em}
.summary:focus{outline:3px solid var(--wf-accent-ink);outline-offset:2px}
.summary h3{margin:0 0 .25em;font-size:1em;color:var(--wf-act)}
.summary ul{margin:0;padding-left:1.25em}
.summary a{color:var(--wf-act)}
.actions{display:flex;flex-wrap:wrap;gap:.75em;margin-top:1em}
button,.btn{font:inherit;font-weight:700;min-height:2.75em;min-width:2.75em;padding:.5em 1.25em;border:2px solid var(--wf-ink);border-radius:var(--wf-radius-1);background:var(--wf-ink);color:var(--wf-surface);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
button.alt,.btn.alt{background:var(--wf-surface);color:var(--wf-ink)}
button[disabled]{opacity:1;background:var(--wf-ink-muted);border-color:var(--wf-ink-muted);cursor:default}
a{color:var(--wf-accent-ink)}
:is(a,button,input,select,textarea,.summary):focus-visible{outline:3px solid var(--wf-accent-ink);outline-offset:2px}
:is(a,button,input,select,textarea,label,.opt){scroll-margin:6em 0}
.range{font-family:var(--wf-font-display);font-size:2em;font-weight:700;line-height:1.2;margin:.25em 0 .5em}
.tag{display:inline-block;font-family:var(--wf-font-mono);font-size:.875em;border:1px solid var(--wf-ink);border-radius:var(--wf-radius-1);padding:.125em .5em;margin:0 0 .75em}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.wf .fallback{margin-top:1em;font-size:.9375em}
@media (prefers-reduced-motion:no-preference){button,.btn,.opt{transition:background-color .12s linear}}
@media (max-width:30em){.wf{padding:1em;border-radius:0}.actions>*{flex:1 1 100%}}
`

// Small DOM helper: text goes in via textContent only.
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== false && v !== null) el.setAttribute(k, v === true ? '' : v)
  for (const k of kids.flat()) if (k !== undefined && k !== null && k !== false) el.append(k)
  return el
}
const tpl = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '')

class WfTool extends HTMLElement {
  connectedCallback() {
    if (this.root) return
    this.root = this.attachShadow({ mode: 'open' })
    this.uid = 'wf-' + CFG.id
    this.token = ''
    // A constructed stylesheet is not blocked by a strict host CSP; the <style> fallback is for old browsers.
    try { const sh = new CSSStyleSheet(); sh.replaceSync(brandCss(brand) + CSS); this.root.adoptedStyleSheets = [sh] } catch { this.root.append(h('style', {}, brandCss(brand) + CSS)) }
    this.live = h('p', { class: 'sr', role: 'status', 'aria-live': 'polite' })
    this.main = h('div', { class: 'wf', part: 'root' })
    this.root.append(this.live, this.main, h('slot', { name: 'challenge' }))
    this.main.addEventListener('focusin', e => this.reveal(e.target))
    this.flow = createFlow({ steps: CFG.steps, rules: CFG.rules, copy, enquiryFields: CFG.enquiryFields })
    this.flow.view()
    this.draw(true)
    this.pump()
    if (window.parent !== window && /[?&]embed=1\b/.test(location.search)) {
      const post = () => window.parent.postMessage({ type: 'wf-height', id: CFG.id, height: Math.ceil(document.documentElement.scrollHeight) }, '*')
      new ResizeObserver(post).observe(document.documentElement); post()
    }
  }

  // Events: tell the Worker (counts only) and let the host page listen too.
  pump() {
    for (const e of this.flow.drain()) {
      if (!EVENTS.includes(e.event)) continue
      this.dispatchEvent(new CustomEvent('wf:event', { detail: { tool: CFG.id, ...e }, bubbles: true, composed: true }))
      if (CFG.endpoint) fetch(CFG.endpoint + '/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tool: CFG.id, ...e }), keepalive: true, credentials: 'omit', mode: 'cors' }).catch(() => {})
    }
  }

  // Synchronous: replacing the text node re-announces even identical text, and no timer can land a stale announcement after the visitor has moved on.
  // WCAG 2.4.11: a focused control must not sit under the host's sticky header or cookie banner, nor partly off screen. The browser only scrolls
  // when a control is fully hidden, and cannot know about the host's overlays, so check what is really on top at the control's centre.
  reveal(el) {
    const r = el.getBoundingClientRect(), clamp = (v, max) => Math.min(Math.max(v, 0), max - 1)
    const covered = [[2, 2], [r.width / 2, r.height / 2], [r.width - 2, r.height - 2]].some(([dx, dy]) => {
      const top = document.elementFromPoint(clamp(r.left + dx, innerWidth), clamp(r.top + dy, innerHeight))
      return top && top !== this && !this.contains(top)
    })
    if (r.top < 0 || r.bottom > innerHeight || covered) el.scrollIntoView({ block: 'center', behavior: 'instant' })
  }

  say(t) { this.live.replaceChildren(t) }

  field(f, value, err, onInput) {
    const id = `${this.uid}-${f.name}`, eid = id + '-err', hid = id + '-hint'
    const desc = [f.hint ? hid : '', err ? eid : ''].filter(Boolean).join(' ') || undefined
    const hint = f.hint ? h('span', { class: 'hint', id: hid }, f.hint) : null
    const error = err ? h('p', { class: 'err', id: eid }, h('span', {}, copy.error_prefix + ' '), err) : null
    const req = f.required ? '' : ` ${copy.optional}`
    if (f.type === 'consent') {
      const cb = h('input', { type: 'checkbox', id, name: f.name, 'aria-describedby': desc })
      cb.checked = value === true
      cb.addEventListener('change', () => onInput(cb.checked))
      return h('div', { class: 'field' }, h('label', { class: 'opt', for: id }, cb, h('span', {}, f.label)), error)
    }
    if (f.type === 'select' && f.options.length <= 4) {
      const g = h('fieldset', { class: 'field', 'aria-describedby': desc, 'data-name': f.name }, h('legend', {}, f.label + req), hint)
      for (const o of f.options) {
        const ov = o.value ?? o, oid = `${id}-${ov}`
        const r = h('input', { type: 'radio', id: oid, name: id, value: ov }); r.checked = value === ov
        r.addEventListener('change', () => onInput(ov))
        g.append(h('label', { class: 'opt', for: oid }, r, h('span', {}, o.label ?? o)))
      }
      if (error) g.append(error)
      g.firstInput = () => g.querySelector('input:checked') ?? g.querySelector('input')
      return g
    }
    let input
    if (f.type === 'select') {
      input = h('select', { id, name: f.name }, h('option', { value: '' }, copy.choose), f.options.map(o => h('option', { value: o.value ?? o }, o.label ?? o)))
    } else {
      const t = { email: 'email', phone: 'tel', date: 'date' }[f.type] ?? 'text'
      const ac = { email: 'email', phone: 'tel', postcode: 'postal-code' }[f.name] ?? { email: 'email', phone: 'tel', postcode: 'postal-code' }[f.type] ?? (f.name === 'name' ? 'name' : 'off')
      input = h('input', { type: t, id, name: f.name, autocomplete: ac, inputmode: f.type === 'number' ? 'numeric' : undefined, maxlength: f.bounds?.max && f.type === 'text' ? f.bounds.max : undefined })
    }
    if (f.type === 'text' && f.rows) { input = h('textarea', { id, name: f.name, rows: f.rows, maxlength: f.bounds?.max }) }
    if (desc) input.setAttribute('aria-describedby', desc)
    if (f.required) input.setAttribute('aria-required', 'true')
    if (err) input.setAttribute('aria-invalid', 'true')
    input.value = value ?? ''
    input.addEventListener('input', () => onInput(input.value))
    input.addEventListener('change', () => onInput(input.value))
    return h('div', { class: 'field' }, h('label', { for: id }, f.label + req), hint, input, error)
  }

  summary(errors, fields) {
    const names = Object.keys(errors)
    if (!names.length) return null
    const s = h('div', { class: 'summary', tabindex: '-1', role: 'alert', 'data-summary': '' }, h('h3', {}, copy.summary_title), h('ul', {}, names.map(n => {
      const f = fields.find(x => x.name === n), a = h('a', { href: '#' + this.uid + '-' + n }, f.label)
      a.addEventListener('click', ev => { ev.preventDefault(); this.focusField(n) })
      return h('li', {}, a, ': ' + errors[n])
    })))
    return s
  }

  focusField(name) {
    const el = this.main.querySelector(`#${this.uid}-${name}`) ?? this.main.querySelector(`[data-name="${name}"]`)?.firstInput?.()
    el?.focus()
  }

  draw(first) {
    const f = this.flow, st = f.state
    if (!first) this.live.replaceChildren()   // an old announcement must not outlive its screen
    this.main.replaceChildren()
    let title, body
    if (st.phase === 'steps') body = this.stepView(title = CFG.steps[st.index])
    else if (st.phase === 'result') body = this.resultView()
    else if (st.phase === 'enquiry') body = this.enquiryView()
    else body = this.doneView()
    this.main.append(body)
    this.main.append(this.fallback())
    this.main.dataset.phase = st.phase
    if (!first) {
      const target = Object.keys(st.phase === 'enquiry' ? st.enquiryErrors : st.errors).length ? this.main.querySelector('[data-summary]') : this.main.querySelector('h2')
      target?.focus({ preventScroll: false })
    }
  }

  fallback() {
    const p = h('p', { class: 'fallback muted' })
    p.append(copy.fallback_lead + ' ')
    const onHosted = CFG.hosted_url && location.origin === new URL(CFG.hosted_url).origin
    if (CFG.hosted_url && !onHosted) p.append(h('a', { href: CFG.hosted_url }, copy.fallback_link), ' ')
    if (CFG.phone) p.append(copy.fallback_phone + ' ', h('a', { href: 'tel:' + CFG.phone.replace(/\s/g, '') }, CFG.phone))
    return p
  }

  stepView(step) {
    const f = this.flow, st = f.state, pr = f.progress()
    const form = h('form', { novalidate: true, 'aria-labelledby': this.uid + '-h' })
    form.append(h('p', { class: 'stepno' }, tpl(copy.step_of, { n: pr.n, of: pr.of })), h('h2', { id: this.uid + '-h', tabindex: '-1' }, step.label))
    if (step.intro) form.append(h('p', { class: 'muted' }, step.intro))
    const sum = this.summary(st.errors, step.fields); if (sum) form.append(sum)
    for (const fl of step.fields) form.append(this.field(fl, st.values[fl.name], st.errors[fl.name], v => { f.set(fl.name, v); this.pump() }))
    const acts = h('div', { class: 'actions' })
    if (st.index > 0) { const b = h('button', { type: 'button', class: 'alt' }, copy.back); b.addEventListener('click', () => { f.back(); this.draw(); this.say(copy.moved_back) }); acts.append(b) }
    acts.append(h('button', { type: 'submit' }, st.index === CFG.steps.length - 1 ? copy.see_estimate : copy.next))
    form.append(acts)
    form.addEventListener('submit', ev => { ev.preventDefault(); const ok = f.next(); this.pump(); this.draw(); if (ok) this.say(f.state.phase === 'result' ? resultSpeech(f.state.result) : tpl(copy.step_of, { n: f.state.index + 1, of: CFG.steps.length })) })
    return form
  }

  resultView() {
    const f = this.flow, r = f.state.result, d = h('div')
    const stopCopy = copy.stop[r.stop_reason] ?? copy.stop.default
    d.append(h('h2', { id: this.uid + '-h', tabindex: '-1' }, r.ok ? copy.result.title : copy.stop.title))
    if (r.ok) {
      d.append(h('p', { class: 'tag' }, copy.result.estimate_label), h('p', { class: 'range' }, rangeText(r, copy)), h('p', {}, copy.result.buckets[r.bucket] ?? ''), h('p', { class: 'muted' }, copy.result.disclaimer))
    } else d.append(h('p', {}, stopCopy))
    const acts = h('div', { class: 'actions' })
    const back = h('button', { type: 'button', class: 'alt' }, copy.change_answers); back.addEventListener('click', () => { f.back(); this.draw() })
    const go = h('button', { type: 'button' }, r.ok ? copy.result.cta : copy.stop.cta); go.addEventListener('click', () => { f.toEnquiry(); this.draw(); this.maybeChallenge() })
    acts.append(back, go); d.append(acts)
    return d
  }

  enquiryView() {
    const f = this.flow, st = f.state
    const form = h('form', { novalidate: true, 'aria-labelledby': this.uid + '-h' })
    form.append(h('h2', { id: this.uid + '-h', tabindex: '-1' }, copy.enquiry.title), h('p', { class: 'muted' }, copy.enquiry.intro))
    const sum = this.summary(st.enquiryErrors, CFG.enquiryFields); if (sum) form.append(sum)
    for (const fl of CFG.enquiryFields) form.append(this.field(fl, st.enquiry[fl.name], st.enquiryErrors[fl.name], v => f.setEnquiry(fl.name, v)))
    const hp = h('div', { class: 'hp', 'aria-hidden': 'true' }, h('label', { for: this.uid + '-hp' }, copy.enquiry.honeypot), h('input', { type: 'text', id: this.uid + '-hp', name: 'company_website', tabindex: '-1', autocomplete: 'off' }))
    form.append(hp)
    form.append(h('p', { class: 'muted' }, copy.enquiry.privacy_lead + ' ', h('a', { href: CFG.privacy_url, target: '_blank', rel: 'noopener' }, copy.enquiry.privacy_link), '.'))
    if (this.sendError) form.append(h('p', { class: 'err', role: 'alert' }, this.sendError))
    const acts = h('div', { class: 'actions' })
    const b = h('button', { type: 'button', class: 'alt' }, copy.back); b.addEventListener('click', () => { f.back(); this.draw() })
    const send = h('button', { type: 'submit' }, copy.enquiry.send)
    acts.append(b, send); form.append(acts)
    form.addEventListener('submit', async ev => {
      ev.preventDefault()
      const body = f.prepareEnquiry(); this.pump()
      if (!body) { this.draw(); return }
      send.disabled = true; send.textContent = copy.enquiry.sending
      try {
        const res = await fetch(CFG.endpoint + '/enquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'omit', mode: 'cors',
          body: JSON.stringify({ tool: CFG.id, submission_id: crypto.randomUUID(), turnstile_token: this.token, company_website: hp.querySelector('input').value, ...body }) })
        if (!res.ok) throw new Error(String(res.status))
        this.sendError = ''; f.sent(); this.pump(); this.draw(); this.say(copy.enquiry.sent_title)
      } catch (e) {
        f.failed('send_failed'); this.pump(); this.sendError = copy.enquiry.send_failed; this.draw(); this.main.querySelector('.err[role=alert]')?.scrollIntoView?.({ block: 'center' })
      }
    })
    return form
  }

  doneView() {
    return h('div', {}, h('h2', { id: this.uid + '-h', tabindex: '-1' }, copy.enquiry.sent_title), h('p', {}, copy.enquiry.sent_body))
  }

  // Turnstile (non-interactive where Cloudflare allows) renders in the light DOM through a slot, so its iframe is not trapped in our shadow root.
  maybeChallenge() {
    if (!CFG.turnstile_site_key || this.challenge) return
    this.challenge = h('div', { slot: 'challenge' }); this.append(this.challenge)
    const go = () => window.turnstile.render(this.challenge, { sitekey: CFG.turnstile_site_key, callback: t => { this.token = t }, 'error-callback': () => { this.token = '' } })
    if (window.turnstile) go()
    else { const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true; s.onload = go; document.head.append(s) }
  }
}
const resultSpeech = r => r.ok ? tpl(copy.result.speech, { range: rangeText(r, copy) }) : copy.stop.title
if (!customElements.get('wf-tool')) customElements.define('wf-tool', WfTool)

})();
