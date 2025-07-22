export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  capabilities: string[]
  maxTokens: number
  supportsArabic: boolean
  reasoningType?: "deep" | "visual" | "analytical" | "creative" | "versatile"
  apiEndpoint?: string
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "qwen-qwq-32b",
    name: "Qwen QwQ 32B",
    provider: "groq",
    description: "نموذج متقدم للتفكير العميق والتحليل المنطقي",
    capabilities: ["reasoning", "analysis", "problem_solving", "arabic", "mathematics"],
    maxTokens: 32768,
    supportsArabic: true,
    reasoningType: "deep",
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    provider: "groq",
    description: "نموذج متعدد الاستخدامات وسريع الاستجابة",
    capabilities: ["general_purpose", "fast_response", "multilingual", "arabic"],
    maxTokens: 32768,
    supportsArabic: true,
    reasoningType: "versatile",
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    description: "نموذج متخصص في التفكير المنطقي والاستنتاج العميق",
    capabilities: ["deep_reasoning", "logic", "mathematics", "coding", "arabic"],
    maxTokens: 64000,
    supportsArabic: true,
    reasoningType: "analytical",
    apiEndpoint: "https://api.deepseek.com",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    description: "نموذج محادثة متقدم من DeepSeek",
    capabilities: ["conversation", "general_purpose", "coding", "arabic"],
    maxTokens: 32000,
    supportsArabic: true,
    reasoningType: "creative",
    apiEndpoint: "https://api.deepseek.com",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "together",
    description: "أحدث إصدار من DeepSeek مع قدرات محسنة",
    capabilities: ["general_purpose", "coding", "analysis", "creative_writing", "arabic"],
    maxTokens: 128000,
    supportsArabic: true,
    reasoningType: "creative",
    apiEndpoint: "https://api.together.xyz/v1",
  },
]

export const DEFAULT_CHAT_MODEL = "qwen-qwq-32b"

export function getModelById(id: string): AIModel | undefined {
  return AVAILABLE_MODELS.find((model) => model.id === id)
}

export function getModelsByProvider(provider: string): AIModel[] {
  return AVAILABLE_MODELS.filter((model) => model.provider === provider)
}

export function getReasoningModels(): AIModel[] {
  return AVAILABLE_MODELS.filter((model) => model.reasoningType === "deep" || model.reasoningType === "analytical")
}
