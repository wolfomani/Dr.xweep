export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  capabilities: string[]
  maxTokens: number
  supportsArabic: boolean
  reasoningType?: "deep" | "visual" | "analytical" | "creative"
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
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    description: "نموذج متخصص في التفكير المنطقي والاستنتاج",
    capabilities: ["deep_reasoning", "logic", "mathematics", "coding", "arabic"],
    maxTokens: 64000,
    supportsArabic: true,
    reasoningType: "analytical",
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
  },
  {
    id: "gemini",
    name: "Gemini Pro",
    provider: "google",
    description: "نموذج Google المتقدم للمحادثة والتحليل",
    capabilities: ["multimodal", "analysis", "creative", "arabic", "visual"],
    maxTokens: 32000,
    supportsArabic: true,
    reasoningType: "visual",
  },
]

export const DEFAULT_CHAT_MODEL = "qwen-qwq-32b"

export function getModelById(id: string): AIModel | undefined {
  return AVAILABLE_MODELS.find((model) => model.id === id)
}

export function getModelsByProvider(provider: string): AIModel[] {
  return AVAILABLE_MODELS.filter((model) => model.provider === provider)
}
