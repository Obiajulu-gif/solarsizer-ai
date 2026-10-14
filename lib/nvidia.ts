import OpenAI from "openai";
import type { Complete } from "./parseAppliances";

let client: OpenAI | null = null;

/** Chat completion via NVIDIA's OpenAI-compatible API (build.nvidia.com). Server only. */
export const nvidiaComplete: Complete = async (system, user) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");
  // Free tier sometimes queues for minutes; fail fast with a clear message instead.
  client ??= new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1", timeout: Number(process.env.NVIDIA_TIMEOUT_MS ?? 30_000), maxRetries: 0 });
  // gpt-oss-20b: available in Nigeria (Meta Llama models are geo-blocked there). Reasoning model, so it needs
  // headroom in max_tokens for its hidden reasoning before the JSON answer.
  const model = process.env.NVIDIA_MODEL ?? "openai/gpt-oss-20b";
  const res = await client.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 2000,
    ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" as const } : {}),
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
};
