// Gemini-powered company research. Uses Google Search grounding so the
// model looks the company up on the live web before answering.

export const GEMINI_KEY_SETTING = "gemini_api_key";

const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export interface AutofillResult {
  industry: string | null;
  website: string | null;
  contact: string | null;
  summary: string | null;
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

export async function autofillCompany(name: string, apiKey: string): Promise<AutofillResult> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(name) }] }],
      tools: [{ google_search: {} }],
    }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err?.error?.message ?? detail;
    } catch {
      // keep the status-code message
    }
    throw new Error(detail);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("") ?? "";
  if (!text) throw new Error("Empty response from Gemini");

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
  };
}

/** Quick round-trip to confirm a key works. Returns the model's reply text. */
export async function testGeminiKey(apiKey: string): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Reply with the single word: ready" }] }],
    }),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err?.error?.message ?? detail;
    } catch {
      // keep the status-code message
    }
    throw new Error(detail);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}
