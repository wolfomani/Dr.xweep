import { simulateReadableStream } from "ai"
import { MockLanguageModelV2 } from "ai/test"
import { getResponseChunksByPrompt } from "@/tests/prompts/utils"

// Mock models for testing
export const chatModel = new MockLanguageModelV2({
  doGenerate: async ({ prompt }) => {
    const promptText = Array.isArray(prompt)
      ? prompt.map((p) => (typeof p === "string" ? p : p.content)).join(" ")
      : typeof prompt === "string"
        ? prompt
        : JSON.stringify(prompt)

    let responseText = "Hello, world!"

    if (promptText.toLowerCase().includes("code")) {
      responseText = 'Here is the code you requested:\n\n```javascript\nconsole.log("Hello, World!");\n```'
    } else if (promptText.toLowerCase().includes("weather")) {
      responseText = "The current weather is sunny with 22°C."
    } else if (promptText.toLowerCase().includes("help")) {
      responseText = "I am here to help you with any questions or tasks you have."
    }

    return {
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: "stop",
      usage: {
        inputTokens: Math.floor(promptText.length / 4),
        outputTokens: Math.floor(responseText.length / 4),
        totalTokens: Math.floor((promptText.length + responseText.length) / 4),
      },
      content: [{ type: "text", text: responseText }],
      warnings: [],
    }
  },
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 50,
      initialDelayInMs: 100,
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
})

export const reasoningModel = new MockLanguageModelV2({
  doGenerate: async ({ prompt }) => {
    const promptText = Array.isArray(prompt)
      ? prompt.map((p) => (typeof p === "string" ? p : p.content)).join(" ")
      : typeof prompt === "string"
        ? prompt
        : JSON.stringify(prompt)

    const responseText = `Let me think about this step by step:

1. First, I need to understand the question: ${promptText.slice(0, 100)}...
2. Then, I'll analyze the key components
3. Finally, I'll provide a comprehensive answer

Based on my reasoning, here is my response: This is a thoughtful analysis of your request.`

    return {
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: "stop",
      usage: {
        inputTokens: Math.floor(promptText.length / 4),
        outputTokens: Math.floor(responseText.length / 4),
        totalTokens: Math.floor((promptText.length + responseText.length) / 4),
      },
      content: [{ type: "text", text: responseText }],
      warnings: [],
    }
  },
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 100,
      initialDelayInMs: 200,
      chunks: getResponseChunksByPrompt(prompt, true),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
})

export const titleModel = new MockLanguageModelV2({
  doGenerate: async ({ prompt }) => {
    const promptText = Array.isArray(prompt)
      ? prompt.map((p) => (typeof p === "string" ? p : p.content)).join(" ")
      : typeof prompt === "string"
        ? prompt
        : JSON.stringify(prompt)

    let title = "New Chat"

    if (promptText.toLowerCase().includes("code")) {
      title = "Code Discussion"
    } else if (promptText.toLowerCase().includes("weather")) {
      title = "Weather Inquiry"
    } else if (promptText.toLowerCase().includes("help")) {
      title = "Help Request"
    } else if (promptText.toLowerCase().includes("question")) {
      title = "Q&A Session"
    } else if (promptText.length > 20) {
      // Generate title from first few words
      const words = promptText.split(" ").slice(0, 4)
      title = words
        .join(" ")
        .replace(/[^\w\s]/gi, "")
        .trim()
      if (title.length > 30) {
        title = title.slice(0, 27) + "..."
      }
    }

    return {
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: "stop",
      usage: {
        inputTokens: Math.floor(promptText.length / 4),
        outputTokens: Math.floor(title.length / 4),
        totalTokens: Math.floor((promptText.length + title.length) / 4),
      },
      content: [{ type: "text", text: title }],
      warnings: [],
    }
  },
  doStream: async ({ prompt }) => {
    const promptText = Array.isArray(prompt)
      ? prompt.map((p) => (typeof p === "string" ? p : p.content)).join(" ")
      : typeof prompt === "string"
        ? prompt
        : JSON.stringify(prompt)

    let title = "New Chat"

    if (promptText.toLowerCase().includes("code")) {
      title = "Code Discussion"
    } else if (promptText.toLowerCase().includes("weather")) {
      title = "Weather Inquiry"
    } else if (promptText.length > 20) {
      const words = promptText.split(" ").slice(0, 4)
      title = words
        .join(" ")
        .replace(/[^\w\s]/gi, "")
        .trim()
      if (title.length > 30) {
        title = title.slice(0, 27) + "..."
      }
    }

    return {
      stream: simulateReadableStream({
        chunkDelayInMs: 25,
        initialDelayInMs: 50,
        chunks: [
          { id: "1", type: "text-start" },
          { id: "1", type: "text-delta", delta: title },
          { id: "1", type: "text-end" },
          {
            type: "finish",
            finishReason: "stop",
            usage: { inputTokens: 5, outputTokens: 8, totalTokens: 13 },
          },
        ],
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    }
  },
})

export const artifactModel = new MockLanguageModelV2({
  doGenerate: async ({ prompt }) => {
    const promptText = Array.isArray(prompt)
      ? prompt.map((p) => (typeof p === "string" ? p : p.content)).join(" ")
      : typeof prompt === "string"
        ? prompt
        : JSON.stringify(prompt)

    let artifactContent = "Artifact generated successfully!"

    if (promptText.toLowerCase().includes("component")) {
      artifactContent = `import React from 'react'

export default function GeneratedComponent() {
  return (
    <div className="p-4">
      <h1>Generated Component</h1>
      <p>This component was generated based on your request.</p>
    </div>
  )
}`
    } else if (promptText.toLowerCase().includes("function")) {
      artifactContent = `function generatedFunction() {
  // Generated based on your request
  console.log('Function executed successfully!')
  return 'Success'
}`
    } else if (promptText.toLowerCase().includes("html")) {
      artifactContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
</head>
<body>
  <h1>Generated HTML</h1>
  <p>This HTML was generated based on your request.</p>
</body>
</html>`
    }

    return {
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: "stop",
      usage: {
        inputTokens: Math.floor(promptText.length / 4),
        outputTokens: Math.floor(artifactContent.length / 4),
        totalTokens: Math.floor((promptText.length + artifactContent.length) / 4),
      },
      content: [{ type: "text", text: artifactContent }],
      warnings: [],
    }
  },
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 25,
      initialDelayInMs: 50,
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
})

// Export all models as a collection
export const testModels = {
  chatModel,
  reasoningModel,
  titleModel,
  artifactModel,
}

// Helper functions for testing
export function getModelByName(name: "chat" | "reasoning" | "title" | "artifact") {
  switch (name) {
    case "chat":
      return chatModel
    case "reasoning":
      return reasoningModel
    case "title":
      return titleModel
    case "artifact":
      return artifactModel
    default:
      return chatModel
  }
}

export function validateModelResponse(response: any): boolean {
  return (
    response &&
    typeof response === "object" &&
    "rawCall" in response &&
    "finishReason" in response &&
    "usage" in response &&
    "content" in response
  )
}

// Test utilities
export async function testModelGeneration(model: MockLanguageModelV2, prompt: string) {
  try {
    const result = await model.doGenerate({ prompt })
    return {
      success: true,
      result,
      isValid: validateModelResponse(result),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      isValid: false,
    }
  }
}

export async function testModelStreaming(model: MockLanguageModelV2, prompt: string) {
  try {
    const result = await model.doStream({ prompt })
    return {
      success: true,
      hasStream: !!result.stream,
      hasRawCall: !!result.rawCall,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      hasStream: false,
      hasRawCall: false,
    }
  }
}

// Default export for compatibility
export default testModels
