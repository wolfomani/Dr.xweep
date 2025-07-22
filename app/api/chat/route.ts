import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, selectedModel = "qwen-qwq-32b" } = await req.json()

  // Select the appropriate model based on the request
  let model

  switch (selectedModel) {
    case "qwen-qwq-32b":
      model = groq("qwen-qwq-32b")
      break
    case "deepseek-reasoner":
      // Using OpenAI-compatible API for DeepSeek
      model = openai("deepseek-reasoner", {
        baseURL: process.env.DEEPSEEK_API_URL,
        apiKey: process.env.DEEPSEEK_API_KEY,
      })
      break
    case "deepseek-v3":
      // Using Together API for DeepSeek V3
      model = openai("deepseek-ai/DeepSeek-V3", {
        baseURL: process.env.TOGETHER_API_URL,
        apiKey: process.env.TOGETHER_API_KEY,
      })
      break
    case "gemini":
      // For Gemini, we'll use the Groq fallback for now
      model = groq("qwen-qwq-32b")
      break
    default:
      model = groq("qwen-qwq-32b")
  }

  const result = streamText({
    model,
    messages,
    system: `أنت مساعد ذكي يتحدث العربية بطلاقة. تجيب على الأسئلة بوضوح ودقة وتقدم المساعدة في جميع المجالات. 
    تتبع منهجية التفكير العميق وتقدم إجابات مفصلة ومفيدة.`,
  })

  return result.toDataStreamResponse()
}
