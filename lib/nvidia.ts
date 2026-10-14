import OpenAI from "openai";
import type { Complete } from "./parseAppliances";

let client: OpenAI | null = null;

/** Chat completion via NVIDIA's OpenAI-compatible API (build.nvidia.com). Server only. */
export const nvidiaComplete: Complete = async (system, user) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");
  client ??= new OpenAI({ apiKey, baseURL: "https://integrate.api.nvidia.com/v1" });
  const res = await client.chat.completions.create({
    model: process.env.NVIDIA_MODEL ?? "meta/llama-3.3-70b-instruct",
    temperature: 0,
    max_tokens: 800,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
};
