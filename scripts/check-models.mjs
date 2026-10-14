// Finds which NVIDIA models answer from your location. Usage: node scripts/check-models.mjs
// Reads NVIDIA_API_KEY from .env.local. Never prints the key.
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const key = env.match(/^NVIDIA_API_KEY=(.*)$/m)?.[1]?.trim();
if (!key?.startsWith("nvapi-")) {
  console.error("Put NVIDIA_API_KEY=nvapi-... in .env.local first");
  process.exit(1);
}

const BASE = "https://integrate.api.nvidia.com/v1";
const CANDIDATES = [
  "mistralai/mistral-small-24b-instruct",
  "mistralai/mistral-medium-3-instruct",
  "qwen/qwen2.5-7b-instruct",
  "qwen/qwen3-235b-a22b",
  "deepseek-ai/deepseek-v3.1",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "moonshotai/kimi-k2-instruct",
  "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  "google/gemma-3-27b-it",
  "meta/llama-3.3-70b-instruct",
];

const listed = new Set(
  ((await (await fetch(`${BASE}/models`, { headers: { Authorization: `Bearer ${key}` } })).json()).data ?? []).map((m) => m.id),
);

const prompt =
  'Reply with ONLY a JSON array: [{"name":"TV","watts":100,"hours":6,"qty":1,"motor":false}] for the text "one TV".';
for (const model of CANDIDATES) {
  if (listed.size && !listed.has(model)) { console.log(`skip   ${model} (not in catalog)`); continue; }
  const t = Date.now();
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, temperature: 0, max_tokens: 200, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(30000),
    });
    const body = await res.json().catch(() => ({}));
    const text = body.choices?.[0]?.message?.content ?? "";
    const ok = res.ok && text.includes("[");
    console.log(`${ok ? "OK    " : "FAIL  "} ${model}  ${res.status}  ${Date.now() - t}ms  ${ok ? "" : JSON.stringify(body).slice(0, 120)}`);
  } catch (e) {
    console.log(`FAIL   ${model}  ${e.name}`);
  }
}
