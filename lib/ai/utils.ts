// Sampling utilities for AI models
export interface SamplingConfig {
  temperature?: number
  topP?: number
  topK?: number
  frequencyPenalty?: number
  presencePenalty?: number
  maxTokens?: number
}

// Regular sampling configuration
export const regularSampling: SamplingConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  maxTokens: 4096,
}

// Predefined sampling configurations
export const samplingPresets = {
  creative: {
    temperature: 0.9,
    topP: 0.95,
    topK: 50,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
    maxTokens: 4096,
  } as SamplingConfig,

  balanced: regularSampling,

  precise: {
    temperature: 0.3,
    topP: 0.8,
    topK: 20,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    maxTokens: 4096,
  } as SamplingConfig,

  deterministic: {
    temperature: 0.0,
    topP: 1.0,
    topK: 1,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    maxTokens: 4096,
  } as SamplingConfig,
}

// Utility functions
export function validateSamplingConfig(config: SamplingConfig): boolean {
  const { temperature, topP, topK, frequencyPenalty, presencePenalty, maxTokens } = config

  return (
    (temperature === undefined || (temperature >= 0 && temperature <= 2)) &&
    (topP === undefined || (topP >= 0 && topP <= 1)) &&
    (topK === undefined || topK > 0) &&
    (frequencyPenalty === undefined || (frequencyPenalty >= -2 && frequencyPenalty <= 2)) &&
    (presencePenalty === undefined || (presencePenalty >= -2 && presencePenalty <= 2)) &&
    (maxTokens === undefined || maxTokens > 0)
  )
}

export function mergeSamplingConfigs(base: SamplingConfig, override: Partial<SamplingConfig>): SamplingConfig {
  return {
    ...base,
    ...override,
  }
}

export function getSamplingPreset(preset: keyof typeof samplingPresets): SamplingConfig {
  return samplingPresets[preset] || regularSampling
}

export function createSamplingConfig(options: Partial<SamplingConfig> = {}): SamplingConfig {
  return mergeSamplingConfigs(regularSampling, options)
}

// Token estimation utilities
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4)
}

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokens(text)
  if (estimatedTokens <= maxTokens) {
    return text
  }

  const maxChars = maxTokens * 4
  return text.slice(0, maxChars) + "..."
}

// Response formatting utilities
export function formatModelResponse(response: any): string {
  if (typeof response === "string") {
    return response
  }

  if (response?.content) {
    return Array.isArray(response.content)
      ? response.content.map((c: any) => c.text || c.content || "").join("")
      : response.content
  }

  if (response?.text) {
    return response.text
  }

  return JSON.stringify(response)
}

export function extractTextFromMessage(message: any): string {
  if (typeof message === "string") {
    return message
  }

  if (message?.content) {
    return formatModelResponse(message)
  }

  if (message?.text) {
    return message.text
  }

  return ""
}

// Export all utilities
export default {
  regularSampling,
  samplingPresets,
  validateSamplingConfig,
  mergeSamplingConfigs,
  getSamplingPreset,
  createSamplingConfig,
  estimateTokens,
  truncateToTokenLimit,
  formatModelResponse,
  extractTextFromMessage,
}
