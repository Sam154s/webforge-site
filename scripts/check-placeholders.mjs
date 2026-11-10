// Fails a production build if a [CAPITAL LETTERS] placeholder is left in a visible string in src/.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const production = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
const PLACEHOLDER = /\[[A-Z][A-Z0-9 ,.'/-]*\]/g;
const ALLOWED = ["[SQUARE BRACKETS]"]; // wording of the draft banner on the legal pages

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mdx?)$/.test(f) ? [p] : [];
});

const hits = [];
for (const file of walk("src")) {
  const text = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  text.split("\n").forEach((raw, n) => {
    const line = raw.replace(/(^|\s)\/\/.*$/, "$1");
    for (const m of line.matchAll(PLACEHOLDER)) {
      const before = line[m.index - 1] || "";
      const after = line[m.index + m[0].length] || "";
      if (/[\w)\]]/.test(before) || after === ":" || /[{+*?]/.test(after)) continue; // code: b[KEY], [KEY]: v, regex classes
      if (ALLOWED.includes(m[0])) continue;
      hits.push(`${file}:${n + 1}  ${m[0]}`);
    }
  });
}

if (hits.length && production) {
  console.error("Placeholder check failed. Remove these before a production build:\n" + hits.join("\n"));
  process.exit(1);
}
console.log(hits.length ? `Placeholder check: ${hits.length} found (allowed outside production).` : "Placeholder check: none found.");
