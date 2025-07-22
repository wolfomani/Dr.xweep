import { auth } from "@/app/(auth)/auth"
import { getChatById, getMessagesByChatId, getStreamIdsByChatId } from "@/lib/db/queries"
import type { Chat } from "@/lib/db/schema"
import { ChatSDKError } from "@/lib/errors"
import { differenceInSeconds } from "date-fns"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: chatId } = await params

  const resumeRequestedAt = new Date()

  if (!chatId) {
    return new ChatSDKError("bad_request:api").toResponse()
  }

  const session = await auth()

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse()
  }

  let chat: Chat

  try {
    chat = await getChatById({ id: chatId })
  } catch {
    return new ChatSDKError("not_found:chat").toResponse()
  }

  if (!chat) {
    return new ChatSDKError("not_found:chat").toResponse()
  }

  if (chat.visibility === "private" && chat.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse()
  }

  const streamIds = await getStreamIdsByChatId({ chatId })

  if (!streamIds.length) {
    return new ChatSDKError("not_found:stream").toResponse()
  }

  const recentStreamId = streamIds.at(-1)

  if (!recentStreamId) {
    return new ChatSDKError("not_found:stream").toResponse()
  }

  // Create empty data stream
  const emptyDataStream = new ReadableStream({
    start(controller) {
      controller.close()
    },
  })

  // For when the generation is streaming during SSR
  // but the resumable stream has concluded at this point.
  const messages = await getMessagesByChatId({ id: chatId })
  const mostRecentMessage = messages.at(-1)

  if (!mostRecentMessage) {
    return new Response(emptyDataStream, { status: 200 })
  }

  if (mostRecentMessage.role !== "assistant") {
    return new Response(emptyDataStream, { status: 200 })
  }

  const messageCreatedAt = new Date(mostRecentMessage.createdAt)

  if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
    return new Response(emptyDataStream, { status: 200 })
  }

  // Create restored stream
  const restoredStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const data = JSON.stringify({
        type: "data-appendMessage",
        data: JSON.stringify(mostRecentMessage),
        transient: true,
      })
      controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      controller.close()
    },
  })

  return new Response(restoredStream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
