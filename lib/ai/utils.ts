import type { CoreMessage } from "ai"

// Regular sampling configuration
export interface SamplingConfig {
  temperature?: number
  topP?: number
  topK?: number
  frequencyPenalty?: number
  presencePenalty?: number
  maxTokens?: number
}

// Default sampling configuration
export const defaultSamplingConfig: SamplingConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
  frequencyPenalty: 0,
  presencePenalty: 0,
  maxTokens: 4096,
}

// Regular sampling function
export function regularSampling(config: SamplingConfig = {}) {
  const finalConfig = { ...defaultSamplingConfig, ...config }

  return {
    temperature: finalConfig.temperature,
    topP: finalConfig.topP,
    topK: finalConfig.topK,
    frequencyPenalty: finalConfig.frequencyPenalty,
    presencePenalty: finalConfig.presencePenalty,
    maxTokens: finalConfig.maxTokens,
  }
}

// Creative sampling for more diverse outputs
export function creativeSampling(config: SamplingConfig = {}) {
  return regularSampling({
    temperature: 0.9,
    topP: 0.95,
    topK: 100,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
    ...config,
  })
}

// Conservative sampling for more focused outputs
export function conservativeSampling(config: SamplingConfig = {}) {
  return regularSampling({
    temperature: 0.3,
    topP: 0.8,
    topK: 20,
    frequencyPenalty: 0,
    presencePenalty: 0,
    ...config,
  })
}

// Deterministic sampling for consistent outputs
export function deterministicSampling(config: SamplingConfig = {}) {
  return regularSampling({
    temperature: 0,
    topP: 1,
    topK: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    ...config,
  })
}

// Message utilities
export function formatMessages(messages: CoreMessage[]): CoreMessage[] {
  return messages.map((message) => ({
    ...message,
    content: typeof message.content === "string" ? message.content.trim() : message.content,
  }))
}

export function getLastUserMessage(messages: CoreMessage[]): CoreMessage | undefined {
  return messages.filter((message) => message.role === "user").pop()
}

export function getLastAssistantMessage(messages: CoreMessage[]): CoreMessage | undefined {
  return messages.filter((message) => message.role === "assistant").pop()
}

export function countTokensApprox(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const approxTokens = countTokensApprox(text)
  if (approxTokens <= maxTokens) {
    return text
  }

  const maxChars = maxTokens * 4
  return text.slice(0, maxChars - 3) + "..."
}

// Model capability checks
export function supportsImages(modelId: string): boolean {
  const imageModels = ["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet-20241022", "gemini-1.5-pro"]
  return imageModels.includes(modelId)
}

export function supportsTools(modelId: string): boolean {
  const toolModels = [
    "gpt-4o",
    "gpt-4o-mini",
    "claude-3-5-sonnet-20241022",
    "gemini-1.5-pro",
    "llama-3.1-70b-versatile",
    "grok-beta",
  ]
  return toolModels.includes(modelId)
}

export function getMaxTokens(modelId: string): number {
  const tokenLimits: Record<string, number> = {
    "gpt-4o": 128000,
    "gpt-4o-mini": 128000,
    "o1-preview": 32768,
    "claude-3-5-sonnet-20241022": 200000,
    "gemini-1.5-pro": 2097152,
    "llama-3.1-70b-versatile": 131072,
    "grok-beta": 131072,
  }

  return tokenLimits[modelId] || 4096
}

// Export all utilities
export default {
  regularSampling,
  creativeSampling,
  conservativeSampling,
  deterministicSampling,
  formatMessages,
  getLastUserMessage,
  getLastAssistantMessage,
  countTokensApprox,
  truncateToTokenLimit,
  supportsImages,
  supportsTools,
  getMaxTokens,
  defaultSamplingConfig,
}
