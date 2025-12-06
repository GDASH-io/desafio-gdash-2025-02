import { Ollama } from "ollama";

const ollama = new Ollama({
  host: process.env.LLM_HOST,
})

export async function RequestMessageLLM(message: string, systeminstruction: string, format: string): Promise<string> {
  const response = await ollama.chat({
    model: process.env.LLM_MODEL || "gemma3",
    messages: [{role: "system", content: systeminstruction}, { role: "user", content: message }],
    format: format
  })
  return response.message.content
}