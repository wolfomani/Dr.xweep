import { deepseek } from "@ai-sdk/deepseek"
import { groq } from "@ai-sdk/groq"
import { togetherai } from "@ai-sdk/togetherai"
import { google } from "@ai-sdk/google"

export const AI_MODELS = {
  // DeepSeek Models - استخدام النماذج الصحيحة
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    model: deepseek("deepseek-chat"),
    maxTokens: 4096,
    supportsImages: false,
    supportsTools: true,
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    model: deepseek("deepseek-reasoner"),
    maxTokens: 4096,
    supportsImages: false,
    supportsTools: true,
  },

  // Groq Models - النماذج المتاحة الصحيحة
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B Versatile",
    provider: "groq",
    model: groq("llama-3.3-70b-versatile"),
    maxTokens: 8192,
    supportsImages: false,
    supportsTools: true,
  },
  "qwen-qwq-32b": {
    id: "qwen-qwq-32b",
    name: "Qwen QwQ 32B",
    provider: "groq",
    model: groq("qwen-qwq-32b"),
    maxTokens: 8192,
    supportsImages: false,
    supportsTools: true,
  },

  // Together AI Models - النماذج الصحيحة
  "deepseek-ai/DeepSeek-V3": {
    id: "deepseek-ai/DeepSeek-V3",
    name: "DeepSeek V3 (Together)",
    provider: "together",
    model: togetherai("deepseek-ai/DeepSeek-V3"),
    maxTokens: 4096,
    supportsImages: false,
    supportsTools: true,
  },

  // Google Gemini Models - النماذج المتاحة
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    model: google("gemini-1.5-pro"),
    maxTokens: 8192,
    supportsImages: true,
    supportsTools: true,
  },
  "gemini-1.5-flash": {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    model: google("gemini-1.5-flash"),
    maxTokens: 8192,
    supportsImages: true,
    supportsTools: true,
  },
} as const

export type ModelId = keyof typeof AI_MODELS

export function getModel(modelId: ModelId) {
  return AI_MODELS[modelId]
}

export function getAvailableModels() {
  return Object.values(AI_MODELS)
}

// دالة للحصول على النماذج حسب المزود
export function getModelsByProvider(provider: string) {
  return Object.values(AI_MODELS).filter((model) => model.provider === provider)
}
