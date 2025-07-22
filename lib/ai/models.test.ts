// Mock models for testing
export const artifactModel = "gpt-4o"
export const chatModel = "gpt-4o"
export const reasoningModel = "o1-preview"
export const titleModel = "gpt-4o-mini"

// Mock response generator
export function generateMockResponse(prompt: string, modelType = "chat") {
  const responses = {
    chat: "Hello! How can I help you today?",
    reasoning: "Let me think about this step by step...",
    title: "New Chat",
    artifact: "Generated artifact content",
  }

  return {
    id: Math.random().toString(36).substring(7),
    content: responses[modelType as keyof typeof responses] || responses.chat,
    role: "assistant" as const,
    createdAt: new Date().toISOString(),
  }
}

// Mock streaming response
export function generateMockStreamChunks(prompt: string, modelType = "chat") {
  const content = generateMockResponse(prompt, modelType).content
  const chunks = []

  // Split content into chunks
  const words = content.split(" ")
  for (let i = 0; i < words.length; i++) {
    chunks.push({
      id: Math.random().toString(36).substring(7),
      type: "text-delta" as const,
      delta: (i === 0 ? "" : " ") + words[i],
    })
  }

  return [
    { id: "1", type: "text-start" as const },
    ...chunks,
    { id: "1", type: "text-end" as const },
    {
      type: "finish" as const,
      finishReason: "stop" as const,
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    },
  ]
}

// Test utilities
export function testModelResponse(modelName: string, prompt: string) {
  return generateMockResponse(prompt, modelName)
}

export function testModelStream(modelName: string, prompt: string) {
  return generateMockStreamChunks(prompt, modelName)
}

// Export model configurations
export const modelConfigs = {
  [artifactModel]: {
    name: "GPT-4o Artifact",
    provider: "openai",
    maxTokens: 4096,
  },
  [chatModel]: {
    name: "GPT-4o Chat",
    provider: "openai",
    maxTokens: 4096,
  },
  [reasoningModel]: {
    name: "O1 Preview",
    provider: "openai",
    maxTokens: 32768,
  },
  [titleModel]: {
    name: "GPT-4o Mini",
    provider: "openai",
    maxTokens: 16384,
  },
}

// Validation functions
export function validateModelId(modelId: string): boolean {
  return Object.keys(modelConfigs).includes(modelId)
}

export function getModelConfig(modelId: string) {
  return modelConfigs[modelId as keyof typeof modelConfigs]
}

// Default export
export default {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
  generateMockResponse,
  generateMockStreamChunks,
  testModelResponse,
  testModelStream,
  modelConfigs,
  validateModelId,
  getModelConfig,
}
