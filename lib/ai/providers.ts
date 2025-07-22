import { deepseek } from "@ai-sdk/deepseek"
import { groq } from "@ai-sdk/groq"
import { togetherai } from "@ai-sdk/togetherai"
import { google } from "@ai-sdk/google"

// إعداد المزودين مع نقاط النهاية الصحيحة
export const providers = {
  deepseek: deepseek({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com",
  }),
  groq: groq({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1",
  }),
  togetherai: togetherai({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: process.env.TOGETHER_API_URL || "https://api.together.xyz/v1",
  }),
  google: google({
    apiKey: process.env.GEMINI_API_KEY,
  }),
}

// دالة للتحقق من توفر المزود
export function isProviderAvailable(provider: string): boolean {
  switch (provider) {
    case "deepseek":
      return !!process.env.DEEPSEEK_API_KEY
    case "groq":
      return !!process.env.GROQ_API_KEY
    case "together":
      return !!process.env.TOGETHER_API_KEY
    case "google":
      return !!process.env.GEMINI_API_KEY
    default:
      return false
  }
}
