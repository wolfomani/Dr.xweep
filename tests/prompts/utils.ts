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
  // Extract text from prompt for response generation
  const promptText = typeof prompt === "string" ? prompt : JSON.stringify(prompt)

  const baseChunks: TestChunk[] = [
    { id: "1", type: "text-start" },
    { id: "1", type: "text-delta", delta: "Hello! " },
    { id: "1", type: "text-delta", delta: "I understand your request. " },
    { id: "1", type: "text-delta", delta: "Let me help you with that." },
    { id: "1", type: "text-end" },
    {
      id: "1",
      type: "finish",
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    },
  ]

  if (withReasoning) {
    return [
      { id: "1", type: "text-start" },
      { id: "1", type: "text-delta", delta: "Let me think about this... " },
      { id: "1", type: "text-delta", delta: "Analyzing the request... " },
      { id: "1", type: "text-delta", delta: "Based on my analysis, " },
      { id: "1", type: "text-delta", delta: "here is my response: " },
      { id: "1", type: "text-delta", delta: "Hello! I understand your request and will help you." },
      { id: "1", type: "text-end" },
      {
        id: "1",
        type: "finish",
        finishReason: "stop",
        usage: { inputTokens: 15, outputTokens: 35, totalTokens: 50 },
      },
    ]
  }

  // Customize response based on prompt content
  if (promptText.toLowerCase().includes("code")) {
    return [
      { id: "1", type: "text-start" },
      { id: "1", type: "text-delta", delta: "Here is the code you requested:\n\n" },
      { id: "1", type: "text-delta", delta: "```javascript\n" },
      { id: "1", type: "text-delta", delta: 'console.log("Hello, World!");\n' },
      { id: "1", type: "text-delta", delta: "```" },
      { id: "1", type: "text-end" },
      {
        id: "1",
        type: "finish",
        finishReason: "stop",
        usage: { inputTokens: 8, outputTokens: 25, totalTokens: 33 },
      },
    ]
  }

  if (promptText.toLowerCase().includes("weather")) {
    return [
      { id: "1", type: "text-start" },
      { id: "1", type: "text-delta", delta: "Let me check the weather for you. " },
      { id: "1", type: "text-delta", delta: "The current weather is sunny with 22°C." },
      { id: "1", type: "text-end" },
      {
        id: "1",
        type: "finish",
        finishReason: "stop",
        usage: { inputTokens: 12, outputTokens: 18, totalTokens: 30 },
      },
    ]
  }

  return baseChunks
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

export function simulateTypingDelay(text: string, delayMs = 50): TestChunk[] {
  const chunks: TestChunk[] = [{ id: "1", type: "text-start" }]

  // Split text into words for more realistic typing simulation
  const words = text.split(" ")

  words.forEach((word, index) => {
    chunks.push({
      id: "1",
      type: "text-delta",
      delta: index === 0 ? word : ` ${word}`,
    })
  })

  chunks.push({ id: "1", type: "text-end" })
  chunks.push({
    id: "1",
    type: "finish",
    finishReason: "stop",
    usage: {
      inputTokens: Math.floor(text.length / 4),
      outputTokens: Math.floor(text.length / 3),
      totalTokens: Math.floor(text.length / 2),
    },
  })

  return chunks
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
