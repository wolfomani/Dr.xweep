import { tool } from "ai"
import { z } from "zod"
import { createDocument, updateDocument } from "@/lib/db/queries"

export const createDocumentTool = tool({
  description: "Create a new document with the given title and content",
  parameters: z.object({
    title: z.string().describe("The title of the document"),
    content: z.string().describe("The content of the document"),
    type: z.enum(["text", "code", "markdown"]).optional().describe("The type of document"),
  }),
  execute: async ({ title, content, type = "text" }, { userId }: { userId: string }) => {
    try {
      const document = await createDocument(userId, title, content, type)
      return {
        success: true,
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          type: document.type,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to create document",
      }
    }
  },
})

export const updateDocumentTool = tool({
  description: "Update an existing document",
  parameters: z.object({
    id: z.string().describe("The ID of the document to update"),
    title: z.string().optional().describe("The new title of the document"),
    content: z.string().optional().describe("The new content of the document"),
  }),
  execute: async ({ id, title, content }) => {
    try {
      const document = await updateDocument(id, title, content)
      return {
        success: true,
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          type: document.type,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to update document",
      }
    }
  },
})

export const getWeatherTool = tool({
  description: "Get current weather information for a location",
  parameters: z.object({
    location: z.string().describe("The location to get weather for"),
  }),
  execute: async ({ location }) => {
    // Mock weather data - in production, integrate with a real weather API
    const weatherData = {
      location,
      temperature: Math.round(Math.random() * 30 + 10),
      condition: ["sunny", "cloudy", "rainy", "snowy"][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 100),
      windSpeed: Math.round(Math.random() * 20),
    }

    return {
      success: true,
      weather: weatherData,
    }
  },
})

export const requestSuggestionsTool = tool({
  description: "Generate suggestions for improving text",
  parameters: z.object({
    text: z.string().describe("The text to generate suggestions for"),
    type: z.enum(["grammar", "style", "clarity"]).describe("The type of suggestions"),
  }),
  execute: async ({ text, type }) => {
    // Mock suggestions - in production, use AI to generate real suggestions
    const suggestions = [
      {
        original: text.substring(0, 20) + "...",
        suggestion: "Consider rephrasing for better clarity",
        type,
      },
    ]

    return {
      success: true,
      suggestions,
    }
  },
})

export const tools = {
  createDocument: createDocumentTool,
  updateDocument: updateDocumentTool,
  getWeather: getWeatherTool,
  requestSuggestions: requestSuggestionsTool,
}
