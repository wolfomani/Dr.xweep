import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"

// Custom model function
export function customModel(modelId: string) {
  // Parse provider and model from modelId
  if (modelId.startsWith("gpt-") || modelId.startsWith("o1-")) {
    return openai(modelId)
  }

  if (modelId.startsWith("claude-")) {
    return anthropic(modelId)
  }

  if (modelId.startsWith("gemini-")) {
    return google(modelId)
  }

  if (modelId.startsWith("llama") || modelId.startsWith("mixtral")) {
    return groq(modelId)
  }

  if (modelId.startsWith("grok-")) {
    return xai(modelId)
  }

  // Default fallback
  return openai("gpt-4o")
}

// Model configurations
export interface ModelConfig {
  id: string
  name: string
  provider: string
  maxTokens: number
  supportsImages: boolean
  supportsTools: boolean
}

export const modelConfigs: ModelConfig[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    maxTokens: 128000,
    supportsImages: true,
    supportsTools: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    maxTokens: 128000,
    supportsImages: true,
    supportsTools: true,
  },
  {
    id: "o1-preview",
    name: "O1 Preview",
    provider: "openai",
    maxTokens: 32768,
    supportsImages: false,
    supportsTools: false,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    maxTokens: 200000,
    supportsImages: true,
    supportsTools: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    maxTokens: 2097152,
    supportsImages: true,
    supportsTools: true,
  },
  {
    id: "llama-3.1-70b-versatile",
    name: "Llama 3.1 70B",
    provider: "groq",
    maxTokens: 131072,
    supportsImages: false,
    supportsTools: true,
  },
  {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "xai",
    maxTokens: 131072,
    supportsImages: false,
    supportsTools: true,
  },
]

// Helper functions
export function getModelById(id: string): ModelConfig | undefined {
  return modelConfigs.find((model) => model.id === id)
}

export function getModelsByProvider(provider: string): ModelConfig[] {
  return modelConfigs.filter((model) => model.provider === provider)
}

export function getDefaultModel(): ModelConfig {
  return modelConfigs[0] // GPT-4o
}

// Export for compatibility
export default {
  customModel,
  modelConfigs,
  getModelById,
  getModelsByProvider,
  getDefaultModel,
}
