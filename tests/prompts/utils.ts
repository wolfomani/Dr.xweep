// Utility functions for test prompts
export function getResponseChunksByPrompt(prompt: any, withReasoning = false) {
  const baseChunks = [
    { id: "1", type: "text-start" as const },
    { id: "1", type: "text-delta" as const, delta: "Processing your request..." },
    { id: "1", type: "text-delta" as const, delta: " Here is the response." },
    { id: "1", type: "text-end" as const },
    {
      type: "finish" as const,
      finishReason: "stop" as const,
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    },
  ]

  if (withReasoning) {
    return [
      { id: "1", type: "text-start" as const },
      { id: "1", type: "text-delta" as const, delta: "Let me think about this..." },
      { id: "1", type: "text-delta" as const, delta: " Analyzing the prompt..." },
      { id: "1", type: "text-delta" as const, delta: " Here is my reasoned response." },
      { id: "1", type: "text-end" as const },
      {
        type: "finish" as const,
        finishReason: "stop" as const,
        usage: { inputTokens: 15, outputTokens: 30, totalTokens: 45 },
      },
    ]
  }

  return baseChunks
}

export function createMockPrompt(content: string, role: "user" | "assistant" | "system" = "user") {
  return {
    role,
    content,
    timestamp: new Date().toISOString(),
  }
}

export function generateTestChunks(text: string, chunkSize = 10) {
  const chunks = []
  chunks.push({ id: "1", type: "text-start" as const })

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize)
    chunks.push({ id: "1", type: "text-delta" as const, delta: chunk })
  }

  chunks.push({ id: "1", type: "text-end" as const })
  chunks.push({
    type: "finish" as const,
    finishReason: "stop" as const,
    usage: { inputTokens: 10, outputTokens: text.length, totalTokens: 10 + text.length },
  })

  return chunks
}
