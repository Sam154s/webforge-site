// The call from the browser straight to the shop's own AI provider. Our server never sees the key or the drawing.
// Pure functions (build the request, read the reply), so they can be tested without a key. No imports, for Node tests.

export type Provider = "anthropic" | "openai";
export type FileIn = { name: string; mime: "application/pdf" | "image/png" | "image/jpeg"; base64: string };
export type Req = { url: string; init: { method: "POST"; headers: Record<string, string>; body: string } };

export const PROVIDERS: Record<Provider, { label: string; model: string; keyHint: string; keysUrl: string }> = {
  anthropic: { label: "Anthropic Claude", model: "claude-sonnet-5-5", keyHint: "sk-ant-...", keysUrl: "https://platform.claude.com/settings/keys" },
  openai: { label: "OpenAI ChatGPT", model: "gpt-6.2-astra", keyHint: "sk-...", keysUrl: "https://platform.openai.com/api-keys" },
};

const ASK = "Check the attached drawing and fill in the fields.";

export function buildRequest(provider: Provider, key: string, model: string, file: FileIn, system: string, schema: object): Req {
  if (provider === "anthropic") {
    const attach = file.mime === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: file.base64 } }
      : { type: "image", source: { type: "base64", media_type: file.mime, data: file.base64 } };
    return {
      url: "https://api.anthropic.com/v1/messages",
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2026-10-21",
          // Needed for a call from a web page. The key is the shop's own, typed into its own browser.
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: 16000,
          system,
          output_config: { format: { type: "json_schema", schema } },
          messages: [{ role: "user", content: [attach, { type: "text", text: ASK }] }],
        }),
      },
    };
  }
  const attach = file.mime === "application/pdf"
    ? { type: "input_file", filename: file.name || "drawing.pdf", file_data: `data:application/pdf;base64,${file.base64}` }
    : { type: "input_image", image_url: `data:${file.mime};base64,${file.base64}`, detail: "high" };
  return {
    url: "https://api.openai.com/v1/responses",
    init: {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        store: false, // don't keep the response on the provider's side for later retrieval
        instructions: system,
        input: [{ role: "user", content: [attach, { type: "input_text", text: ASK }] }],
        text: { format: { type: "json_schema", name: "drawing_check", schema, strict: true } },
      }),
    },
  };
}

export type Outcome = { ok: true; raw: unknown } | { ok: false; message: string };

const STATUS: Record<number, string> = {
  401: "Your AI provider turned the key down. Check it's copied in full and still active.",
  403: "Your key isn't allowed to use that model. Check the model name, or your account's permissions.",
  404: "Your AI provider doesn't know that model name. Check it in settings.",
  413: "That file is too big for your AI provider. Try a smaller PDF or image.",
  429: "Your AI account has hit its limit or run out of credit. Check billing with your provider, or try again shortly.",
};

// Reads the provider's reply into the JSON the model wrote, or a plain message for the person.
export function readReply(provider: Provider, status: number, body: unknown): Outcome {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const errMsg = String((b.error as { message?: unknown } | undefined)?.message ?? "").toLowerCase();
  if (status !== 200) {
    if (status === 400 && /credit|billing|balance|quota/.test(errMsg)) return { ok: false, message: STATUS[429] };
    if (status === 400 && /pdf|image|file|document|media/.test(errMsg)) return { ok: false, message: "Your AI provider couldn't read that file. Try a clearer PDF, PNG or JPG of the drawing." };
    if (status === 400 && /model/.test(errMsg)) return { ok: false, message: STATUS[404] };
    if (STATUS[status]) return { ok: false, message: STATUS[status] };
    if (status >= 500 || status === 529) return { ok: false, message: "Your AI provider is busy or down. Try again in a minute." };
    return { ok: false, message: "Your AI provider turned the request down. Check the model name in settings and try again." };
  }
  let text = "";
  if (provider === "anthropic") {
    if (b.stop_reason === "refusal") return { ok: false, message: "The model declined to check that file. If it's a drawing, try a clearer copy." };
    if (b.stop_reason === "max_tokens") return { ok: false, message: "The answer was cut off. Try again, or try a drawing with one sheet." };
    const content = Array.isArray(b.content) ? (b.content as { type?: string; text?: string }[]) : [];
    text = content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  } else {
    if (b.status === "incomplete") return { ok: false, message: "The answer was cut off. Try again, or try a drawing with one sheet." };
    const output = Array.isArray(b.output) ? (b.output as { type?: string; content?: { type?: string; text?: string; refusal?: string }[] }[]) : [];
    const parts = output.filter((o) => o.type === "message").flatMap((o) => o.content ?? []);
    if (parts.some((p) => p.type === "refusal")) return { ok: false, message: "The model declined to check that file. If it's a drawing, try a clearer copy." };
    text = parts.filter((p) => p.type === "output_text").map((p) => p.text ?? "").join("");
  }
  try {
    return { ok: true, raw: JSON.parse(text) };
  } catch {
    return { ok: false, message: "The answer didn't come back in the right shape. Try again." };
  }
}

// The type comes from the first bytes of the file, not its name.
export function sniff(b: Uint8Array): FileIn["mime"] | null {
  if (b.length > 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d) return "application/pdf";
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  return null;
}
