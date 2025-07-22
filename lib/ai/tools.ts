import { z } from "zod"
import { tool } from "ai"
import { generateUUID } from "@/lib/utils"
import { saveDocument, updateDocument as updateDocumentInDb, getDocumentById } from "@/lib/db/queries"
import type { Session } from "next-auth"

// Weather tool
export const getWeather = tool({
  description: "Get the current weather for a location",
  parameters: z.object({
    latitude: z.number().describe("Latitude coordinate"),
    longitude: z.number().describe("Longitude coordinate"),
  }),
  execute: async ({ latitude, longitude }) => {
    try {
      // Mock weather data - in production, use a real weather API
      const weatherData = {
        location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
        temperature: Math.round(Math.random() * 30 + 10), // 10-40°C
        condition: ["sunny", "cloudy", "rainy", "snowy"][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 100),
        windSpeed: Math.round(Math.random() * 20),
        timestamp: new Date().toISOString(),
      }

      return {
        success: true,
        data: weatherData,
        message: `Current weather at ${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.condition}`,
      }
    } catch (error) {
      console.error("Error fetching weather:", error)
      return {
        success: false,
        error: "Failed to fetch weather data",
        message: "Unable to retrieve weather information at this time.",
      }
    }
  },
})

// Create document tool
export function createDocument({
  session,
  dataStream,
}: {
  session: Session
  dataStream?: any
}) {
  return tool({
    description: "Create a new document with the given title and content",
    parameters: z.object({
      title: z.string().describe("The title of the document"),
      content: z.string().optional().describe("Initial content for the document"),
    }),
    execute: async ({ title, content = "" }) => {
      try {
        if (!session?.user?.id) {
          return {
            success: false,
            error: "User not authenticated",
            message: "You must be logged in to create documents.",
          }
        }

        const documentId = generateUUID()

        const document = await saveDocument({
          id: documentId,
          title,
          content,
          userId: session.user.id,
        })

        // Notify data stream if available
        if (dataStream) {
          dataStream.writeData({
            type: "document-created",
            data: {
              id: document.id,
              title: document.title,
              content: document.content,
            },
          })
        }

        return {
          success: true,
          data: {
            id: document.id,
            title: document.title,
            content: document.content,
            createdAt: document.createdAt,
          },
          message: `Document "${title}" created successfully.`,
        }
      } catch (error) {
        console.error("Error creating document:", error)
        return {
          success: false,
          error: "Failed to create document",
          message: "Unable to create the document at this time.",
        }
      }
    },
  })
}

// Update document tool
export function updateDocument({
  session,
  dataStream,
}: {
  session: Session
  dataStream?: any
}) {
  return tool({
    description: "Update an existing document with new content",
    parameters: z.object({
      id: z.string().describe("The ID of the document to update"),
      title: z.string().optional().describe("New title for the document"),
      content: z.string().optional().describe("New content for the document"),
    }),
    execute: async ({ id, title, content }) => {
      try {
        if (!session?.user?.id) {
          return {
            success: false,
            error: "User not authenticated",
            message: "You must be logged in to update documents.",
          }
        }

        // Check if document exists and user owns it
        const existingDocument = await getDocumentById({ id })

        if (!existingDocument) {
          return {
            success: false,
            error: "Document not found",
            message: "The specified document could not be found.",
          }
        }

        if (existingDocument.userId !== session.user.id) {
          return {
            success: false,
            error: "Unauthorized",
            message: "You don't have permission to update this document.",
          }
        }

        const updatedDocument = await updateDocumentInDb({
          id,
          title,
          content,
        })

        // Notify data stream if available
        if (dataStream) {
          dataStream.writeData({
            type: "document-updated",
            data: {
              id: updatedDocument.id,
              title: updatedDocument.title,
              content: updatedDocument.content,
            },
          })
        }

        return {
          success: true,
          data: {
            id: updatedDocument.id,
            title: updatedDocument.title,
            content: updatedDocument.content,
            updatedAt: updatedDocument.updatedAt,
          },
          message: "Document updated successfully.",
        }
      } catch (error) {
        console.error("Error updating document:", error)
        return {
          success: false,
          error: "Failed to update document",
          message: "Unable to update the document at this time.",
        }
      }
    },
  })
}

// Request suggestions tool
export function requestSuggestions({
  session,
  dataStream,
}: {
  session: Session
  dataStream?: any
}) {
  return tool({
    description: "Generate suggestions for improving text or content",
    parameters: z.object({
      text: z.string().describe("The text to generate suggestions for"),
      type: z
        .enum(["grammar", "style", "clarity", "tone", "structure"])
        .optional()
        .describe("Type of suggestions to generate"),
    }),
    execute: async ({ text, type = "grammar" }) => {
      try {
        if (!session?.user?.id) {
          return {
            success: false,
            error: "User not authenticated",
            message: "You must be logged in to request suggestions.",
          }
        }

        // Generate mock suggestions based on type
        const suggestions = generateSuggestions(text, type)

        // Notify data stream if available
        if (dataStream) {
          dataStream.writeData({
            type: "suggestions-generated",
            data: {
              originalText: text,
              suggestions,
              type,
            },
          })
        }

        return {
          success: true,
          data: {
            originalText: text,
            suggestions,
            type,
            count: suggestions.length,
          },
          message: `Generated ${suggestions.length} ${type} suggestions.`,
        }
      } catch (error) {
        console.error("Error generating suggestions:", error)
        return {
          success: false,
          error: "Failed to generate suggestions",
          message: "Unable to generate suggestions at this time.",
        }
      }
    },
  })
}

// Helper function to generate suggestions
function generateSuggestions(text: string, type: string) {
  const suggestions = []

  switch (type) {
    case "grammar":
      // Mock grammar suggestions
      if (text.includes("it's")) {
        suggestions.push({
          id: generateUUID(),
          original: "it's",
          suggested: "its",
          reason: "Use 'its' for possession, 'it's' for 'it is'",
          position: text.indexOf("it's"),
        })
      }
      break

    case "style":
      // Mock style suggestions
      if (text.includes("very")) {
        suggestions.push({
          id: generateUUID(),
          original: "very good",
          suggested: "excellent",
          reason: "Use stronger adjectives instead of 'very + adjective'",
          position: text.indexOf("very"),
        })
      }
      break

    case "clarity":
      // Mock clarity suggestions
      if (text.length > 100) {
        suggestions.push({
          id: generateUUID(),
          original: text.substring(0, 50) + "...",
          suggested: "Consider breaking this into shorter sentences",
          reason: "Long sentences can be hard to follow",
          position: 0,
        })
      }
      break

    case "tone":
      // Mock tone suggestions
      if (text.includes("!")) {
        suggestions.push({
          id: generateUUID(),
          original: "!",
          suggested: ".",
          reason: "Consider using periods for a more professional tone",
          position: text.indexOf("!"),
        })
      }
      break

    case "structure":
      // Mock structure suggestions
      suggestions.push({
        id: generateUUID(),
        original: text,
        suggested: "Consider adding topic sentences to improve structure",
        reason: "Clear structure helps readers follow your ideas",
        position: 0,
      })
      break
  }

  return suggestions
}

// Export all tools
export default {
  getWeather,
  createDocument,
  updateDocument,
  requestSuggestions,
}
