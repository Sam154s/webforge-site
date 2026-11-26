// Tests for the drawing check that need no key: the request each provider gets, reading replies and errors, the answer
// check, the email and the shop file. Run: node --import ./scripts/ts-hook.mjs --test scripts/drawing-check.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chatPrompt, jsonPrompt } from "../src/app/drawing-check/prompt.ts";
import { buildRequest, readReply, sniff } from "../src/app/drawing-check/providers.ts";
import { bandFrom, buildEmail, SCHEMA, toText, validate } from "../src/app/drawing-check/schema.ts";
import { EXAMPLE_SHOP, readShop, shopFile } from "../src/app/drawing-check/shop.ts";

const pdf = { name: "d.pdf", mime: "application/pdf", base64: "JVBERi0=" };
const png = { name: "d.png", mime: "image/png", base64: "iVBORw==" };
const SAMPLE = JSON.parse(readFileSync(new URL("./fixtures/drawing-check-08.json", import.meta.url), "utf8"));

test("Anthropic request: direct browser access, PDF as a document block, JSON schema output", () => {
  const r = buildRequest("anthropic", "sk-ant-test", "claude-sonnet-5-5", pdf, "SYS", SCHEMA);
  assert.equal(r.url, "https://api.anthropic.com/v1/messages");
  assert.equal(r.init.headers["x-api-key"], "sk-ant-test");
  assert.equal(r.init.headers["anthropic-dangerous-direct-browser-access"], "true");
  assert.ok(r.init.headers["anthropic-version"]);
  const b = JSON.parse(r.init.body);
  assert.equal(b.model, "claude-sonnet-5-5");
  assert.equal(b.system, "SYS");
  assert.deepEqual(b.messages[0].content[0], { type: "document", source: { type: "base64", media_type: "application/pdf", data: "JVBERi0=" } });
  assert.equal(b.messages[0].content[1].type, "text");
  assert.equal(b.output_config.format.type, "json_schema");
  assert.deepEqual(b.output_config.format.schema, SCHEMA);
});

test("Anthropic request: image as an image block", () => {
  const b = JSON.parse(buildRequest("anthropic", "k", "m", png, "S", SCHEMA).init.body);
  assert.deepEqual(b.messages[0].content[0], { type: "image", source: { type: "base64", media_type: "image/png", data: "iVBORw==" } });
});

test("OpenAI request: Responses API, PDF as input_file, image as input_image, strict schema, not stored", () => {
  const r = buildRequest("openai", "sk-test", "gpt-6.2-astra", pdf, "SYS", SCHEMA);
  assert.equal(r.url, "https://api.openai.com/v1/responses");
  assert.equal(r.init.headers.authorization, "Bearer sk-test");
  const b = JSON.parse(r.init.body);
  assert.equal(b.instructions, "SYS");
  assert.equal(b.store, false);
  assert.deepEqual(b.input[0].content[0], { type: "input_file", filename: "d.pdf", file_data: "data:application/pdf;base64,JVBERi0=" });
  assert.equal(b.text.format.type, "json_schema");
  assert.equal(b.text.format.strict, true);
  const i = JSON.parse(buildRequest("openai", "k", "m", png, "S", SCHEMA).init.body);
  assert.equal(i.input[0].content[0].type, "input_image");
  assert.equal(i.input[0].content[0].image_url, "data:image/png;base64,iVBORw==");
});

test("The schema suits strict mode: every object closed and every key required", () => {
  const walk = (s) => {
    if (s.type === "object") { assert.equal(s.additionalProperties, false); assert.deepEqual([...s.required].sort(), Object.keys(s.properties).sort()); Object.values(s.properties).forEach(walk); }
    if (s.type === "array") walk(s.items);
  };
  walk(SCHEMA);
});

test("Replies: Anthropic text and OpenAI output_text are read as JSON", () => {
  const a = readReply("anthropic", 200, { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(SAMPLE) }] });
  assert.ok(a.ok);
  const o = readReply("openai", 200, { status: "completed", output: [{ type: "reasoning" }, { type: "message", content: [{ type: "output_text", text: JSON.stringify(SAMPLE) }] }] });
  assert.ok(o.ok);
  assert.equal(validate(o.raw).part.material, "PEEK 450G");
});

test("Errors become plain messages: bad key, quota, refusal, cut off", () => {
  assert.match(readReply("anthropic", 401, { error: { message: "invalid x-api-key" } }).message, /turned the key down/);
  assert.match(readReply("openai", 429, { error: { message: "You exceeded your current quota" } }).message, /limit or run out of credit/);
  assert.match(readReply("anthropic", 400, { error: { message: "Your credit balance is too low" } }).message, /credit/);
  assert.match(readReply("anthropic", 200, { stop_reason: "refusal", content: [] }).message, /declined/);
  assert.match(readReply("openai", 200, { status: "incomplete" }).message, /cut off/);
  assert.match(readReply("anthropic", 200, { stop_reason: "end_turn", content: [{ type: "text", text: "not json" }] }).message, /right shape/);
});

test("validate: works out bands, sorts tightest first, adds a missing revision", () => {
  assert.equal(bandFrom("Ø8 ±0.01"), 0.02);
  assert.equal(bandFrom("+0.05/-0.01"), 0.06);
  assert.equal(bandFrom("+0/-0.02"), 0.02);
  assert.equal(bandFrom("7.99/8.01"), 0.02);
  assert.equal(bandFrom("Ø6 H7"), null);
  const raw = structuredClone(SAMPLE);
  raw.part.revision = null;
  raw.tightest_tolerances = [{ feature: "a", callout: "±0.1", band_mm: 0.2, where: "x" }, { feature: "b", callout: "±0.005", band_mm: 0.5, where: "y" }];
  const c = validate(raw);
  assert.equal(c.tightest_tolerances[0].band_mm, 0.01);
  assert.equal(c.missing[0].item, "Revision");
  assert.throws(() => validate({ is_drawing: true }));
});

test("Email: missing items, shop questions and the sign-off; none when nothing to ask", () => {
  const c = validate(SAMPLE);
  const e = buildEmail(c, EXAMPLE_SHOP.questions, EXAMPLE_SHOP.signOff);
  assert.match(e.subject, /KI-5521/);
  assert.match(e.body, /When do you need the parts delivered\?/);
  assert.ok(e.body.endsWith("Example Precision Ltd"));
  assert.equal(buildEmail({ ...c, missing: [], against_shop: [] }, [], "Thanks,"), null);
  assert.doesNotMatch(toText(c, e), /[\u2013\u2014]/);
});

test("Prompts carry the shop setup and the footer; no dashes", () => {
  for (const p of [chatPrompt(EXAMPLE_SHOP), jsonPrompt(EXAMPLE_SHOP)]) {
    assert.match(p, /Materials we stock: Aluminium 6082-T6/);
    assert.doesNotMatch(p, /[\u2013\u2014]/);
  }
  assert.match(chatPrompt(EXAMPLE_SHOP), /## 3\. Against my shop/);
  assert.match(chatPrompt(null), /## 3\. Missing or unclear/);
  assert.match(chatPrompt(null), /Read by AI\. Check it against the drawing before you rely on it\.$/);
});

test("Shop file round trip, and a bad file is refused", () => {
  assert.deepEqual(readShop(JSON.parse(shopFile(EXAMPLE_SHOP))), EXAMPLE_SHOP);
  assert.equal(readShop({ hello: 1 }), null);
  assert.equal(readShop("x"), null);
});

test("File type comes from the first bytes", () => {
  assert.equal(sniff(new TextEncoder().encode("%PDF-1.7")), "application/pdf");
  assert.equal(sniff(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), "image/png");
  assert.equal(sniff(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(sniff(new TextEncoder().encode("GIF89a")), null);
});
