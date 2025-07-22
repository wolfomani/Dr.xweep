import { auth } from "@/app/(auth)/auth"
import { customModel } from "@/lib/ai"
import { models } from "@/lib/ai/models"
import { systemPrompt } from "@/lib/ai/prompts"
import { regularSampling } from "@/lib/ai/utils"
import { deleteChatById, getChatById, getDocumentById, saveChat, saveMessages, saveStreamId } from "@/lib/db/queries"
import { generateUUID, getMostRecentUserMessage } from "@/lib/utils"
import { convertToCoreMessages, type Message, streamText, tool, generateId } from "ai"
import { z } from "zod"
import { createDocument, getWeather, requestSuggestions, updateDocument } from "@/lib/ai/tools"

export const maxDuration = 60

type AllowedTools = "createDocument" | "updateDocument" | "requestSuggestions" | "getWeather"

const blocksTools: AllowedTools[] = ["createDocument", "updateDocument", "requestSuggestions", "getWeather"]

const allTools: AllowedTools[] = ["createDocument", "updateDocument", "requestSuggestions", "getWeather"]

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: {
    id: string
    messages: Array<Message>
    modelId: string
  } = await request.json()

  const session = await auth()

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const model = models.find((model) => model.id === modelId)

  if (!model) {
    return new Response("Model not found", { status: 404 })
  }

  const coreMessages = convertToCoreMessages(messages)
  const userMessage = getMostRecentUserMessage(messages)

  if (!userMessage) {
    return new Response("No user message found", { status: 400 })
  }

  const chat = await getChatById({ id })

  if (!chat) {
    const title = messages.length > 0 ? messages[0].content.substring(0, 100) : "New Chat"

    await saveChat({
      id,
      userId: session.user.id!,
      title,
    })
  }

  const userMessageId = generateUUID()

  await saveMessages({
    messages: [
      {
        ...userMessage,
        id: userMessageId,
        createdAt: new Date(),
        chatId: id,
      },
    ],
  })

  const streamId = generateId()
  await saveStreamId({ streamId, chatId: id })

  return streamText({
    model: customModel(model.apiIdentifier),
    system: systemPrompt,
    messages: coreMessages,
    maxSteps: 5,
    experimental_activeTools: allTools,
    tools: {
      getWeather: tool({
        description: `Get the current weather at a location. Displays the weather to the user.`,
        parameters: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        execute: async ({ latitude, longitude }) => {
          const weather = await getWeather({ latitude, longitude })
          return weather
        },
      }),
      createDocument: tool({
        description: "Create a document for a writing activity",
        parameters: z.object({
          title: z.string(),
        }),
        execute: async ({ title }) => {
          const id = generateUUID()
          const createdAt = new Date()
          const document = {
            id,
            title,
            content: "",
            userId: session.user?.id!,
            createdAt,
          }

          await createDocument({ document })
          return document
        },
      }),
      updateDocument: tool({
        description: "Update a document with new content",
        parameters: z.object({
          id: z.string().describe("The ID of the document to update"),
          content: z.string().describe("The new content for the document"),
        }),
        execute: async ({ id, content }) => {
          const document = await getDocumentById({ id })

          if (!document) {
            return { error: "Document not found" }
          }

          if (document.userId !== session.user?.id) {
            return { error: "Unauthorized" }
          }

          await updateDocument({ id, content })
          return { success: true }
        },
      }),
      requestSuggestions: tool({
        description: "Request suggestions for a user prompt",
        parameters: z.object({
          message: z.string().describe("The user message to get suggestions for"),
        }),
        execute: async ({ message }) => {
          const suggestions = await requestSuggestions({ message })
          return suggestions
        },
      }),
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user?.id) {
        try {
          const responseMessagesWithoutIncompleteToolCalls = responseMessages.map((message) => ({
            ...message,
            content: message.content.filter((content) => {
              return content.type === "text" || (content.type === "tool-call" && "result" in content)
            }),
          }))

          await saveMessages({
            messages: responseMessagesWithoutIncompleteToolCalls.map((message) => {
              const messageId = generateUUID()

              return {
                id: messageId,
                chatId: id,
                role: message.role,
                content: message.content,
                createdAt: new Date(),
              }
            }),
          })
        } catch (error) {
          console.error("Failed to save chat")
        }
      }
    },
    experimental_transform: regularSampling,
  }).toDataStreamResponse({
    getErrorMessage: (error) => {
      if (error == null) {
        return "An unknown error occurred."
      }

      if (typeof error === "string") {
        return error
      }

      if (error instanceof Error) {
        return error.message
      }

      return "An unknown error occurred."
    },
  })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return new Response("Not Found", { status: 404 })
  }

  const session = await auth()

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const chat = await getChatById({ id })

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    await deleteChatById({ id })

    return new Response("Chat deleted", { status: 200 })
  } catch (error) {
    return new Response("An error occurred while deleting the chat", {
      status: 500,
    })
  }
}

// Helper function to get stream context (simplified version)
export function getStreamContext() {
  return {
    resumableStream: async (streamId: string, fallback: () => any) => {
      // This is a simplified implementation
      // In a real app, you'd implement proper stream resumption logic
      return null
    },
  }
}
