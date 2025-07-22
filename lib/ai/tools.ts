import { tool } from "ai"
import { z } from "zod"
import { saveDocument, getDocumentById } from "@/lib/db/queries"
import { generateUUID } from "@/lib/utils"

// Create Document Tool
export const createDocument = tool({
  description: "Create a new document with specified content and metadata",
  parameters: z.object({
    title: z.string().describe("The title of the document"),
    content: z.string().describe("The content of the document"),
    kind: z.enum(["text", "code", "image", "sheet"]).describe("The type of document"),
    userId: z.string().optional().describe("The user ID who owns the document"),
  }),
  execute: async ({ title, content, kind, userId = "anonymous" }) => {
    try {
      const documentId = generateUUID()

      const result = await saveDocument({
        id: documentId,
        title,
        content,
        kind: kind as any,
        userId,
      })

      return {
        success: true,
        documentId,
        message: `Document "${title}" created successfully`,
        document: result[0],
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create document",
      }
    }
  },
})

// Update Document Tool
export const updateDocument = tool({
  description: "Update an existing document with new content",
  parameters: z.object({
    documentId: z.string().describe("The ID of the document to update"),
    title: z.string().optional().describe("New title for the document"),
    content: z.string().describe("New content for the document"),
    kind: z.enum(["text", "code", "image", "sheet"]).optional().describe("New type of document"),
  }),
  execute: async ({ documentId, title, content, kind }) => {
    try {
      // First check if document exists
      const existingDoc = await getDocumentById({ id: documentId })

      if (!existingDoc) {
        return {
          success: false,
          error: "Document not found",
        }
      }

      // Create a new version of the document
      const newDocumentId = generateUUID()

      const result = await saveDocument({
        id: newDocumentId,
        title: title || existingDoc.title,
        content,
        kind: (kind || existingDoc.kind) as any,
        userId: existingDoc.userId,
      })

      return {
        success: true,
        documentId: newDocumentId,
        originalDocumentId: documentId,
        message: `Document updated successfully`,
        document: result[0],
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update document",
      }
    }
  },
})

// Get Weather Tool
export const getWeather = tool({
  description: "Get current weather information for a specified location",
  parameters: z.object({
    location: z.string().describe("The city or location to get weather for"),
    units: z.enum(["celsius", "fahrenheit"]).default("celsius").describe("Temperature units"),
  }),
  execute: async ({ location, units }) => {
    try {
      // Mock weather data - in a real app, you'd call a weather API
      const weatherData = {
        location,
        temperature: units === "celsius" ? 22 : 72,
        condition: "Partly cloudy",
        humidity: 65,
        windSpeed: units === "celsius" ? "15 km/h" : "9 mph",
        units,
        timestamp: new Date().toISOString(),
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      return {
        success: true,
        weather: weatherData,
        message: `Current weather in ${location}: ${weatherData.temperature}°${units === "celsius" ? "C" : "F"}, ${weatherData.condition}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get weather information",
      }
    }
  },
})

// Request Suggestions Tool
export const requestSuggestions = tool({
  description: "Generate suggestions based on the current context or document",
  parameters: z.object({
    context: z.string().describe("The context or content to generate suggestions for"),
    type: z.enum(["improvement", "completion", "alternative", "related"]).describe("Type of suggestions to generate"),
    count: z.number().min(1).max(10).default(3).describe("Number of suggestions to generate"),
    documentId: z.string().optional().describe("Document ID if suggestions are for a specific document"),
  }),
  execute: async ({ context, type, count, documentId }) => {
    try {
      // Generate mock suggestions based on type
      const suggestionTemplates = {
        improvement: [
          "Consider adding more detailed explanations",
          "You could improve readability by breaking this into smaller sections",
          "Adding examples would make this clearer",
          "Consider using more specific terminology",
          "This could benefit from additional context",
        ],
        completion: [
          "You might want to add a conclusion",
          "Consider adding implementation details",
          "This could use more examples",
          "Adding error handling would be beneficial",
          "Consider including performance considerations",
        ],
        alternative: [
          "An alternative approach could be...",
          "You could also consider...",
          "Another way to handle this is...",
          "A different perspective might be...",
          "Alternatively, you could...",
        ],
        related: [
          "This relates to the concept of...",
          "You might also be interested in...",
          "This connects to...",
          "Similar ideas can be found in...",
          "This builds upon...",
        ],
      }

      const templates = suggestionTemplates[type]
      const suggestions = []

      for (let i = 0; i < Math.min(count, templates.length); i++) {
        suggestions.push({
          id: generateUUID(),
          text: templates[i],
          type,
          relevance: Math.random() * 0.3 + 0.7, // Random relevance between 0.7-1.0
          timestamp: new Date().toISOString(),
        })
      }

      return {
        success: true,
        suggestions,
        context: context.slice(0, 100) + (context.length > 100 ? "..." : ""),
        type,
        count: suggestions.length,
        documentId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate suggestions",
      }
    }
  },
})

// Additional utility tools
export const searchDocuments = tool({
  description: "Search for documents based on title or content",
  parameters: z.object({
    query: z.string().describe("Search query"),
    userId: z.string().optional().describe("User ID to filter documents"),
    limit: z.number().min(1).max(50).default(10).describe("Maximum number of results"),
  }),
  execute: async ({ query, userId, limit }) => {
    try {
      // Mock search results - in a real app, you'd implement full-text search
      const mockResults = [
        {
          id: generateUUID(),
          title: `Document containing "${query}"`,
          content: `This document contains information about ${query}...`,
          kind: "text",
          userId: userId || "anonymous",
          createdAt: new Date().toISOString(),
          relevance: 0.95,
        },
        {
          id: generateUUID(),
          title: `Related to ${query}`,
          content: `Additional information related to ${query}...`,
          kind: "text",
          userId: userId || "anonymous",
          createdAt: new Date().toISOString(),
          relevance: 0.87,
        },
      ]

      return {
        success: true,
        results: mockResults.slice(0, limit),
        query,
        totalFound: mockResults.length,
        limit,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search documents",
      }
    }
  },
})

export const analyzeText = tool({
  description: "Analyze text for various metrics and insights",
  parameters: z.object({
    text: z.string().describe("Text to analyze"),
    analysisType: z.enum(["readability", "sentiment", "keywords", "summary"]).describe("Type of analysis to perform"),
  }),
  execute: async ({ text, analysisType }) => {
    try {
      const wordCount = text.split(/\s+/).length
      const charCount = text.length
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length

      let analysis = {}

      switch (analysisType) {
        case "readability":
          analysis = {
            wordCount,
            charCount,
            sentences,
            avgWordsPerSentence: Math.round(wordCount / sentences),
            readingTime: Math.ceil(wordCount / 200), // Assuming 200 words per minute
            complexity: wordCount > 1000 ? "high" : wordCount > 500 ? "medium" : "low",
          }
          break

        case "sentiment":
          // Mock sentiment analysis
          const positiveWords = ["good", "great", "excellent", "amazing", "wonderful", "fantastic"]
          const negativeWords = ["bad", "terrible", "awful", "horrible", "disappointing"]

          const positive = positiveWords.filter((word) => text.toLowerCase().includes(word)).length
          const negative = negativeWords.filter((word) => text.toLowerCase().includes(word)).length

          analysis = {
            sentiment: positive > negative ? "positive" : negative > positive ? "negative" : "neutral",
            confidence: Math.abs(positive - negative) / Math.max(positive + negative, 1),
            positiveWords: positive,
            negativeWords: negative,
          }
          break

        case "keywords":
          // Simple keyword extraction
          const words = text.toLowerCase().match(/\b\w{4,}\b/g) || []
          const frequency: Record<string, number> = {}

          words.forEach((word) => {
            frequency[word] = (frequency[word] || 0) + 1
          })

          const keywords = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }))

          analysis = {
            keywords,
            totalUniqueWords: Object.keys(frequency).length,
            mostFrequent: keywords[0]?.word || "none",
          }
          break

        case "summary":
          // Simple extractive summary (first and last sentences)
          const sentenceArray = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
          const summary =
            sentenceArray.length > 2
              ? `${sentenceArray[0].trim()}. ... ${sentenceArray[sentenceArray.length - 1].trim()}.`
              : text

          analysis = {
            summary,
            originalLength: charCount,
            summaryLength: summary.length,
            compressionRatio: Math.round((summary.length / charCount) * 100),
          }
          break
      }

      return {
        success: true,
        analysisType,
        analysis,
        metadata: {
          wordCount,
          charCount,
          sentences,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze text",
      }
    }
  },
})

// Export all tools
export const tools = {
  createDocument,
  updateDocument,
  getWeather,
  requestSuggestions,
  searchDocuments,
  analyzeText,
}

// Export tool configurations
export const toolConfigs = {
  createDocument: {
    name: "Create Document",
    description: "Create new documents with various content types",
    category: "document",
  },
  updateDocument: {
    name: "Update Document",
    description: "Modify existing documents",
    category: "document",
  },
  getWeather: {
    name: "Get Weather",
    description: "Retrieve current weather information",
    category: "utility",
  },
  requestSuggestions: {
    name: "Request Suggestions",
    description: "Generate contextual suggestions",
    category: "ai",
  },
  searchDocuments: {
    name: "Search Documents",
    description: "Find documents by content or title",
    category: "search",
  },
  analyzeText: {
    name: "Analyze Text",
    description: "Perform various text analysis operations",
    category: "analysis",
  },
}

// Default export
export default tools
