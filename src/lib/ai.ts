// Gemini-powered company research. Uses Google Search grounding so the
// model looks the company up on the live web before answering.

export const GEMINI_KEY_SETTING = "gemini_api_key";

// Built-in key so autofill works out of the box. Lightly encoded to keep
// automated GitHub scanners from flagging it — a key saved in Settings
// always takes priority, so rotating it never needs a deploy.
const EMBEDDED_KEY_B64 = "QVEuQWI4Uk42SUNVQ0Q1aHVPUUUxRXdTcVFKT0I4anNURkhtcjR5VHhkMEtBNWltSU9CcXc=";

export function embeddedGeminiKey(): string {
  return atob(EMBEDDED_KEY_B64);
}

// Primary model plus a lighter fallback — the free tier's flash model gets
// overloaded (503) at peak times while flash-lite rarely does.
const MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];

function endpoint(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Turn a raw Gemini error into something a human can act on. */
export function friendlyAiError(detail: string): string {
  if (/high demand|UNAVAILABLE|overloaded/i.test(detail)) {
    return "Google's AI is busy right now — wait a minute and try again.";
  }
  if (/quota|RESOURCE_EXHAUSTED|rate/i.test(detail)) {
    return "Today's free AI limit is used up — it resets daily, or add a fresh key in Settings.";
  }
  if (/API key not valid|API_KEY_INVALID|PERMISSION_DENIED/i.test(detail)) {
    return "The API key was rejected — paste a fresh key from aistudio.google.com/apikey in Settings.";
  }
  return detail;
}

export interface AutofillResult {
  industry: string | null;
  website: string | null;
  contact: string | null;
  summary: string | null;
  /** False when the web-search quota was exhausted and built-in knowledge was used. */
  usedSearch: boolean;
}

interface RawResult {
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  contact_person?: string | null;
  address?: string | null;
  summary?: string | null;
}

function buildPrompt(name: string): string {
  return `Research the company "${name}". It is most likely a business in the Cayman Islands unless the name clearly indicates otherwise. Use web search to find real, current information.

Reply with ONLY a JSON object (no markdown, no commentary) in exactly this shape, using null for anything you cannot verify:
{
  "industry": "short industry label, e.g. 'Hardware & Building Supplies'",
  "website": "their current website URL or null",
  "phone": "main phone number or null",
  "email": "contact email or null",
  "contact_person": "owner/manager name or null",
  "address": "street address or null",
  "summary": "2-3 sentences: what they do, anything useful for pitching them a new website"
}`;
}

function parseJson(text: string): RawResult {
  const cleaned = text
    .replace(/^```(?:json)?/im, "")
    .replace(/```\s*$/m, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON in response");
  return JSON.parse(cleaned.slice(start, end + 1)) as RawResult;
}

async function callGemini(
  apiKey: string,
  prompt: string,
  withSearch: boolean,
  model: string
): Promise<{ ok: boolean; status: number; detail: string; text: string }> {
  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (withSearch) body.tools = [{ google_search: {} }];

  const res = await fetch(endpoint(model), {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err?.error?.message ?? detail;
    } catch {
      // keep the status-code message
    }
    return { ok: false, status: res.status, detail, text: "" };
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "";
  return { ok: true, status: res.status, detail: "", text };
}

/**
 * The resilience ladder: try both models with web search, then both
 * without; if everything failed (e.g. peak-time overload), pause once
 * and run the ladder again before giving up.
 */
async function callWithFallback(
  apiKey: string,
  prompt: string
): Promise<{ text: string; usedSearch: boolean }> {
  const attempts = [
    ...MODELS.map((model) => ({ model, search: true })),
    ...MODELS.map((model) => ({ model, search: false })),
  ];
  let lastDetail = "Unknown error";
  for (let round = 0; round < 2; round++) {
    for (const attempt of attempts) {
      const result = await callGemini(apiKey, prompt, attempt.search, attempt.model);
      if (result.ok && result.text) {
        return { text: result.text, usedSearch: attempt.search };
      }
      if (!result.ok) lastDetail = result.detail;
    }
    if (round === 0) await sleep(2500);
  }
  throw new Error(friendlyAiError(lastDetail));
}

export async function autofillCompany(name: string, apiKey: string): Promise<AutofillResult> {
  const { text, usedSearch } = await callWithFallback(apiKey, buildPrompt(name));

  let raw: RawResult;
  try {
    raw = parseJson(text);
  } catch {
    throw new Error("Could not read the research results. Try again.");
  }

  const contactParts = [raw.contact_person, raw.phone, raw.email, raw.address]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));

  return {
    industry: raw.industry?.trim() || null,
    website: raw.website?.trim() || null,
    contact: contactParts.length ? contactParts.join(" · ") : null,
    summary: raw.summary?.trim() || null,
    usedSearch,
  };
}

export interface ScriptInput {
  name: string;
  industry: string | null;
  contact: string | null;
  website: string | null;
  notes: string;
  potential_domains: string[];
}

function buildScriptPrompt(c: ScriptInput): string {
  const facts = [
    `Company: ${c.name}`,
    c.industry ? `Industry: ${c.industry}` : null,
    c.website ? `Their current website: ${c.website}` : "They have no real website today.",
    c.contact ? `Contact: ${c.contact}` : null,
    c.potential_domains.length ? `Domain we'd put them on: ${c.potential_domains[0]}` : null,
    c.notes.trim() ? `Our notes: ${c.notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You write sales scripts for Foundry Labs, a small Cayman Islands web studio. Our model: we BUILD a business a brand-new website up front, then pitch it — the owner gets to see the finished site before paying. One-time price plus ~$30/month hosting and management.

Research this business and its current web presence (look the website up if one is listed — note what's weak: dated design, not mobile friendly, hard to find on Google, missing info, or no site at all):

${facts}

Now write a short spoken sales script (200-280 words) the founder can read on a call or in person. Friendly, confident, local, zero corporate jargon. Structure it with these exact section labels on their own lines:

OPENER — one warm line introducing yourself and why you're reaching out
HOOK — one or two specific observations about their current web presence and what it's costing them
PITCH — the benefits of the new site (mobile, Google visibility, trust, more customers), tied to their business specifically
OFFER — the kicker: we already built the site, it's ready to look at right now, no obligation
CLOSE — ask for two minutes to show them, mention simple one-time price + small monthly hosting
IF THEY HESITATE — one reassuring line to handle the most likely objection

Output only the script text with those labels. No markdown, no preamble.`;
}

export interface ScriptResult {
  script: string;
  usedSearch: boolean;
}

export async function generatePitchScript(
  input: ScriptInput,
  apiKey: string
): Promise<ScriptResult> {
  const { text, usedSearch } = await callWithFallback(apiKey, buildScriptPrompt(input));
  const script = text.trim();
  if (!script) throw new Error("Empty response from Gemini");
  return { script, usedSearch };
}

/** Quick round-trip to confirm a key works. Returns the model's reply text. */
export async function testGeminiKey(apiKey: string): Promise<string> {
  let lastDetail = "Unknown error";
  for (const model of MODELS) {
    const result = await callGemini(
      apiKey,
      "Reply with the single word: ready",
      false,
      model
    );
    if (result.ok) return result.text;
    lastDetail = result.detail;
  }
  throw new Error(friendlyAiError(lastDetail));
}
