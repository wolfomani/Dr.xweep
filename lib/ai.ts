import { openai } from "@ai-sdk/openai"
import { anthropic } from "@anthropic-ai/sdk"
import { google } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"

// Custom model configuration
export interface CustomModelConfig {
  id: string
  name: string
  provider: "openai" | "anthropic" | "google" | "groq"
  model: string
  maxTokens?: number
  temperature?: number
  topP?: number
}

// Default custom model
export const customModel: CustomModelConfig = {
  id: "custom-gpt-4o",
  name: "Custom GPT-4o",
  provider: "openai",
  model: "gpt-4o",
  maxTokens: 4096,
  temperature: 0.7,
  topP: 0.9,
}

// Available models
export const availableModels: CustomModelConfig[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    model: "gpt-4o",
    maxTokens: 4096,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    model: "gpt-4o-mini",
    maxTokens: 16384,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    maxTokens: 8192,
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "google",
    model: "gemini-pro",
    maxTokens: 2048,
  },
  {
    id: "llama-3-70b",
    name: "Llama 3 70B",
    provider: "groq",
    model: "llama3-70b-8192",
    maxTokens: 8192,
  },
]

// Get model instance
export function getModelInstance(config: CustomModelConfig) {
  switch (config.provider) {
    case "openai":
      return openai(config.model)
    case "anthropic":
      return anthropic(config.model)
    case "google":
      return google(config.model)
    case "groq":
      return groq(config.model)
    default:
      return openai("gpt-4o")
  }
}

// Find model by ID
export function findModelById(id: string): CustomModelConfig | undefined {
  return availableModels.find((model) => model.id === id)
}

// Validate model configuration
export function validateModelConfig(config: CustomModelConfig): boolean {
  return !!(
    config.id &&
    config.name &&
    config.provider &&
    config.model &&
    ["openai", "anthropic", "google", "groq"].includes(config.provider)
  )
}

// Create custom model configuration
export function createCustomModel(
  id: string,
  name: string,
  provider: CustomModelConfig["provider"],
  model: string,
  options?: Partial<Pick<CustomModelConfig, "maxTokens" | "temperature" | "topP">>,
): CustomModelConfig {
  return {
    id,
    name,
    provider,
    model,
    maxTokens: options?.maxTokens || 4096,
    temperature: options?.temperature || 0.7,
    topP: options?.topP || 0.9,
  }
}

// Export default configuration
export default {
  customModel,
  availableModels,
  getModelInstance,
  findModelById,
  validateModelConfig,
  createCustomModel,
}
