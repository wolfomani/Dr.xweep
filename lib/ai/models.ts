export interface ChatModel {
  id: string
  name: string
  provider: string
  providerId: string
  hostedId: string
  platformLink: string
  imageInput: boolean
  pricing: {
    currency: string
    unit: string
    inputCost: number
    outputCost: number
  }
}

export const models: ChatModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    providerId: "openai",
    hostedId: "gpt-4o",
    platformLink: "https://platform.openai.com/docs/models/gpt-4o",
    imageInput: true,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 2.5,
      outputCost: 10,
    },
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    providerId: "openai",
    hostedId: "gpt-4o-mini",
    platformLink: "https://platform.openai.com/docs/models/gpt-4o-mini",
    imageInput: true,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 0.15,
      outputCost: 0.6,
    },
  },
  {
    id: "o1-preview",
    name: "O1 Preview",
    provider: "OpenAI",
    providerId: "openai",
    hostedId: "o1-preview",
    platformLink: "https://platform.openai.com/docs/models/o1",
    imageInput: false,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 15,
      outputCost: 60,
    },
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    providerId: "anthropic",
    hostedId: "claude-3-5-sonnet-20241022",
    platformLink: "https://docs.anthropic.com/claude/docs/models-overview",
    imageInput: true,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 3,
      outputCost: 15,
    },
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    providerId: "google",
    hostedId: "gemini-1.5-pro",
    platformLink: "https://ai.google.dev/models/gemini",
    imageInput: true,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 1.25,
      outputCost: 5,
    },
  },
  {
    id: "llama-3.1-70b-versatile",
    name: "Llama 3.1 70B",
    provider: "Groq",
    providerId: "groq",
    hostedId: "llama-3.1-70b-versatile",
    platformLink: "https://console.groq.com/docs/models",
    imageInput: false,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 0.59,
      outputCost: 0.79,
    },
  },
  {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "xAI",
    providerId: "xai",
    hostedId: "grok-beta",
    platformLink: "https://docs.x.ai/",
    imageInput: false,
    pricing: {
      currency: "USD",
      unit: "1M tokens",
      inputCost: 5,
      outputCost: 15,
    },
  },
]

// Helper functions
export function getModelById(id: string): ChatModel | undefined {
  return models.find((model) => model.id === id)
}

export function getModelsByProvider(providerId: string): ChatModel[] {
  return models.filter((model) => model.providerId === providerId)
}

export function getDefaultModel(): ChatModel {
  return models[0]
}

export function isValidModelId(id: string): boolean {
  return models.some((model) => model.id === id)
}

export function getModelPricing(id: string): ChatModel["pricing"] | null {
  const model = getModelById(id)
  return model ? model.pricing : null
}

export function getModelsWithImageSupport(): ChatModel[] {
  return models.filter((model) => model.imageInput)
}

export function getProviders(): string[] {
  return [...new Set(models.map((model) => model.provider))]
}

// Export types
export type { ChatModel }

// Default export
export default {
  models,
  getModelById,
  getModelsByProvider,
  getDefaultModel,
  isValidModelId,
  getModelPricing,
  getModelsWithImageSupport,
  getProviders,
}
