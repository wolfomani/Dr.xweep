export const DEFAULT_CHAT_MODEL: string = "chat-model"

export interface ChatModel {
  id: string
  name: string
  description: string
  provider?: string
  maxTokens?: number
  temperature?: number
}

export const chatModels: Array<ChatModel> = [
  {
    id: "chat-model",
    name: "Chat model",
    description: "Primary model for all-purpose chat",
    provider: "openai",
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: "chat-model-reasoning",
    name: "Reasoning model",
    description: "Uses advanced reasoning",
    provider: "openai",
    maxTokens: 32768,
    temperature: 0.3,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Latest GPT-4 Omni model",
    provider: "openai",
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Faster, more efficient GPT-4o",
    provider: "openai",
    maxTokens: 16384,
    temperature: 0.7,
  },
  {
    id: "o1-preview",
    name: "O1 Preview",
    description: "Advanced reasoning model",
    provider: "openai",
    maxTokens: 32768,
    temperature: 0.1,
  },
]

// Export models collection
export const models = {
  chatModels,
  DEFAULT_CHAT_MODEL,

  // Helper functions
  getModelById: (id: string): ChatModel | undefined => {
    return chatModels.find((model) => model.id === id)
  },

  getDefaultModel: (): ChatModel => {
    return chatModels.find((model) => model.id === DEFAULT_CHAT_MODEL) || chatModels[0]
  },

  getModelsByProvider: (provider: string): ChatModel[] => {
    return chatModels.filter((model) => model.provider === provider)
  },

  validateModel: (id: string): boolean => {
    return chatModels.some((model) => model.id === id)
  },

  getModelNames: (): string[] => {
    return chatModels.map((model) => model.name)
  },

  getModelIds: (): string[] => {
    return chatModels.map((model) => model.id)
  },
}

// Export individual model configurations
export const modelConfigurations = {
  chat: chatModels.find((m) => m.id === "chat-model"),
  reasoning: chatModels.find((m) => m.id === "chat-model-reasoning"),
  gpt4o: chatModels.find((m) => m.id === "gpt-4o"),
  gpt4oMini: chatModels.find((m) => m.id === "gpt-4o-mini"),
  o1Preview: chatModels.find((m) => m.id === "o1-preview"),
}

// Model utilities
export function createModel(
  id: string,
  name: string,
  description: string,
  options?: Partial<Pick<ChatModel, "provider" | "maxTokens" | "temperature">>,
): ChatModel {
  return {
    id,
    name,
    description,
    provider: options?.provider || "openai",
    maxTokens: options?.maxTokens || 4096,
    temperature: options?.temperature || 0.7,
  }
}

export function isValidModel(model: any): model is ChatModel {
  return (
    typeof model === "object" &&
    model !== null &&
    typeof model.id === "string" &&
    typeof model.name === "string" &&
    typeof model.description === "string"
  )
}

// Default export
export default models
