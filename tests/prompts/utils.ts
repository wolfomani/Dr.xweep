import type { StreamTextResult } from "ai"

export interface TestChunk {
  id: string
  type: "text-start" | "text-delta" | "text-end" | "finish"
  delta?: string
  finishReason?: "stop" | "length" | "content-filter" | "tool-calls"
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

export function getResponseChunksByPrompt(prompt: any, withReasoning = false): TestChunk[] {
  // Convert prompt to string if it's an object or array
  const promptText =
    typeof prompt === "string"
      ? prompt
      : Array.isArray(prompt)
        ? prompt.map((p) => (typeof p === "string" ? p : p.content || "")).join(" ")
        : JSON.stringify(prompt)

  // Generate appropriate response based on prompt content
  let responseText = "Hello! How can I help you today?"

  if (promptText.toLowerCase().includes("code")) {
    responseText = 'Here\'s a code example:\n\n```javascript\nconsole.log("Hello, World!");\n```'
  } else if (promptText.toLowerCase().includes("weather")) {
    responseText = "The current weather is sunny with a temperature of 22°C."
  } else if (promptText.toLowerCase().includes("help")) {
    responseText = "I'm here to help! What would you like assistance with?"
  } else if (promptText.toLowerCase().includes("explain")) {
    responseText = "Let me explain this concept step by step..."
  }

  if (withReasoning) {
    responseText = `Let me think about this step by step:

1. First, I need to understand what you're asking
2. Then, I'll analyze the key components
3. Finally, I'll provide a comprehensive answer

${responseText}`
  }

  // Split response into chunks for streaming simulation
  const words = responseText.split(" ")
  const chunks: TestChunk[] = []

  // Add start chunk
  chunks.push({
    id: "1",
    type: "text-start",
  })

  // Add delta chunks for each word
  words.forEach((word, index) => {
    chunks.push({
      id: "1",
      type: "text-delta",
      delta: (index === 0 ? "" : " ") + word,
    })
  })

  // Add end chunk
  chunks.push({
    id: "1",
    type: "text-end",
  })

  // Add finish chunk
  chunks.push({
    id: "1",
    type: "finish",
    finishReason: "stop",
    usage: {
      inputTokens: Math.ceil(promptText.length / 4),
      outputTokens: Math.ceil(responseText.length / 4),
      totalTokens: Math.ceil((promptText.length + responseText.length) / 4),
    },
  })

  return chunks
}

export function generateTestPrompt(type: "simple" | "complex" | "code" | "reasoning" = "simple"): string {
  const prompts = {
    simple: "Hello, how are you?",
    complex: "Can you explain the concept of machine learning and provide some practical examples?",
    code: "Write a JavaScript function that calculates the factorial of a number",
    reasoning: "What are the pros and cons of renewable energy sources?",
  }

  return prompts[type]
}

export function createMockMessage(content: string, role: "user" | "assistant" | "system" = "user") {
  return {
    id: Math.random().toString(36).substring(7),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

export function createMockConversation(length = 3) {
  const conversation = []

  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      conversation.push(createMockMessage(`User message ${i + 1}`, "user"))
    } else {
      conversation.push(createMockMessage(`Assistant response ${i + 1}`, "assistant"))
    }
  }

  return conversation
}

export function simulateTypingDelay(text: string, delayPerChar = 50): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(text)
    }, text.length * delayPerChar)
  })
}

export function validateChunkSequence(chunks: TestChunk[]): boolean {
  if (chunks.length === 0) return false

  const hasStart = chunks.some((chunk) => chunk.type === "text-start")
  const hasEnd = chunks.some((chunk) => chunk.type === "text-end")
  const hasFinish = chunks.some((chunk) => chunk.type === "finish")

  return hasStart && hasEnd && hasFinish
}

export function extractTextFromChunks(chunks: TestChunk[]): string {
  return chunks
    .filter((chunk) => chunk.type === "text-delta" && chunk.delta)
    .map((chunk) => chunk.delta)
    .join("")
}

export function calculateTokenUsage(text: string): { inputTokens: number; outputTokens: number; totalTokens: number } {
  // Simple token estimation (roughly 4 characters per token)
  const tokens = Math.ceil(text.length / 4)

  return {
    inputTokens: tokens,
    outputTokens: tokens,
    totalTokens: tokens * 2,
  }
}

// Export default utilities
export default {
  getResponseChunksByPrompt,
  generateTestPrompt,
  createMockMessage,
  createMockConversation,
  simulateTypingDelay,
  validateChunkSequence,
  extractTextFromChunks,
  calculateTokenUsage,
}

export function createMockStreamResult(chunks: TestChunk[]): Partial<StreamTextResult> {
  return {
    text: Promise.resolve(
      chunks
        .filter((chunk) => chunk.type === "text-delta")
        .map((chunk) => chunk.delta)
        .join(""),
    ),
    usage: Promise.resolve(
      chunks.find((chunk) => chunk.type === "finish")?.usage || {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
    ),
    finishReason: Promise.resolve(chunks.find((chunk) => chunk.type === "finish")?.finishReason || "stop"),
  }
}

// Helper function for testing different scenarios
export function getChunksByScenario(scenario: string): TestChunk[] {
  switch (scenario) {
    case "success":
      return getResponseChunksByPrompt("test prompt")
    case "reasoning":
      return getResponseChunksByPrompt("test prompt", true)
    case "code":
      return getResponseChunksByPrompt("write code")
    case "weather":
      return getResponseChunksByPrompt("what is the weather")
    case "error":
      return createErrorChunk("Something went wrong")
    case "long":
      return simulateTypingDelay(
        "This is a very long response that simulates a detailed explanation with multiple sentences and comprehensive information.",
      )
    default:
      return getResponseChunksByPrompt("default prompt")
  }
}

export function createErrorChunk(error: string): TestChunk[] {
  return [
    { id: "1", type: "text-start" },
    { id: "1", type: "text-delta", delta: `Error: ${error}` },
    { id: "1", type: "text-end" },
    {
      id: "1",
      type: "finish",
      finishReason: "stop",
      usage: { inputTokens: 5, outputTokens: 10, totalTokens: 15 },
    },
  ]
}
