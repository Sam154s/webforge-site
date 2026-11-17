"use client";

import { useState } from "react";

// A letter carries a short code. Typing it here opens the page written for that company.
// The code is tidied (lower case, no spaces, hyphens put back) and then the browser goes to the private page.
// It is a plain form and a full page load, never a prefetch, so the page is looked up exactly once.
export function tidyCode(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  const bare = s.replace(/-/g, "");
  return /^[a-z0-9]{16}$/.test(bare) && !/^[0-9a-f]{32}$/.test(s) ? bare.match(/.{4}/g)!.join("-") : s;
}

export function CodeForm({ to }: { to: string }) {
  const [bad, setBad] = useState(false);
  return (
    <form
      action={to} method="get" className="code-form"
      onSubmit={(e) => {
        const input = e.currentTarget.elements.namedItem("c") as HTMLInputElement;
        input.value = tidyCode(input.value);
        if (!/^[a-z0-9-]{16,64}$/.test(input.value)) { e.preventDefault(); setBad(true); }
      }}
    >
      <label htmlFor="code">The code from your letter</label>
      <div>
        <input id="code" name="c" required maxLength={80} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="abcd-efgh-jkmn-pqrs" aria-invalid={bad || undefined} aria-describedby={bad ? "code-err" : undefined} onInput={() => setBad(false)} />
        <button type="submit">Open my page <i aria-hidden>→</i></button>
      </div>
      {bad && <p id="code-err" role="alert"><span className="note">That does not look like one of our codes. It is four groups of four, like the example.</span></p>}
    </form>
  );
}
