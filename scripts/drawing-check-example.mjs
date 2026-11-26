// Runs the drawing check on one drawing through the local Claude Code CLI (no API key), with the same prompt and schema the
// page sends to the shop's own key. Used to make the example on /drawing-check and to test against the gym answer key.
//   node --import ./scripts/ts-hook.mjs scripts/drawing-check-example.mjs <drawing> [json|chat] [example|none] [model]
// json: prints the validated check as JSON. chat: prints the answer to the copy-and-paste instruction.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { chatPrompt, jsonPrompt } from "../src/app/drawing-check/prompt.ts";
import { SCHEMA, validate } from "../src/app/drawing-check/schema.ts";
import { EXAMPLE_SHOP } from "../src/app/drawing-check/shop.ts";

const [file, mode = "json", shopArg = "example", model = "claude-sonnet-5-5"] = process.argv.slice(2);
if (!file) { console.error("usage: drawing-check-example.mjs <drawing> [json|chat] [example|none] [model]"); process.exit(1); }
const shop = shopArg === "none" ? null : EXAMPLE_SHOP;

const data = readFileSync(file).toString("base64");
const ext = extname(file).toLowerCase();
const attach = ext === ".pdf"
  ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
  : { type: "image", source: { type: "base64", media_type: ext === ".png" ? "image/png" : "image/jpeg", data } };
const text = mode === "chat" ? chatPrompt(shop) : "Check the attached drawing and fill in the fields.";
const msg = { type: "user", message: { role: "user", content: [attach, { type: "text", text }] } };
const args = ["-p", "--model", model, "--tools", "", "--strict-mcp-config", "--setting-sources", "", "--no-session-persistence",
  "--input-format", "stream-json", "--output-format", "stream-json", "--verbose"];
if (mode !== "chat") args.push("--json-schema", JSON.stringify(SCHEMA), "--system-prompt", jsonPrompt(shop));

const p = spawn("claude", args, { stdio: ["pipe", "pipe", "inherit"] });
let out = "";
p.stdout.on("data", (d) => { out += d; });
p.on("close", (code) => {
  const result = out.split("\n").map((l) => { try { return JSON.parse(l); } catch { return null; } }).find((e) => e?.type === "result");
  if (!result || result.is_error) { console.error("failed", code, result?.result); process.exit(1); }
  if (mode === "chat") process.stdout.write(result.result.trim() + "\n");
  else process.stdout.write(JSON.stringify(validate(result.structured_output), null, 2) + "\n");
});
p.stdin.end(JSON.stringify(msg) + "\n");
