"use client"

import { useChat } from "ai/react"
import { useEffect, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { ChatHeader } from "@/components/chat-header"
import type { Vote } from "@/lib/db/schema"
import { fetcher, generateUUID } from "@/lib/utils"
import { Artifact } from "./artifact"
import { MultimodalInput } from "./multimodal-input"
import { Messages } from "./messages"
import type { VisibilityType } from "./visibility-selector"
import { useArtifactSelector } from "@/hooks/use-artifact"
import { unstable_serialize } from "swr/infinite"
import { getChatHistoryPaginationKey } from "./sidebar-history"
import { toast } from "./toast"
import type { Session } from "next-auth"
import { useSearchParams } from "next/navigation"
import { useChatVisibility } from "@/hooks/use-chat-visibility"
import { useAutoResume } from "@/hooks/use-auto-resume"
import { ChatSDKError } from "@/lib/errors"
import type { Attachment, ChatMessage } from "@/lib/types"
import { useDataStream } from "./data-stream-provider"

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string
  initialMessages: ChatMessage[]
  initialChatModel: string
  initialVisibilityType: VisibilityType
  isReadonly: boolean
  session: Session
  autoResume: boolean
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  })

  const { mutate } = useSWRConfig()
  const { setDataStream } = useDataStream()

  const [input, setInput] = useState<string>("")

  const { messages, setMessages, append, isLoading, stop, reload } = useChat({
    id,
    initialMessages,
    api: "/api/chat",
    body: {
      id,
      selectedChatModel: initialChatModel,
      selectedVisibilityType: visibilityType,
    },
    onResponse: (response) => {
      if (!response.ok) {
        toast({
          type: "error",
          description: "Failed to send message",
        })
      }
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey))
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast({
          type: "error",
          description: error.message,
        })
      }
    },
  })

  const searchParams = useSearchParams()
  const query = searchParams.get("query")

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false)

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        id: generateUUID(),
        role: "user",
        content: query,
      })

      setHasAppendedQuery(true)
      window.history.replaceState({}, "", `/chat/${id}`)
    }
  }, [query, append, hasAppendedQuery, id])

  const { data: votes } = useSWR<Array<Vote>>(messages.length >= 2 ? `/api/vote?chatId=${id}` : null, fetcher)

  const [attachments, setAttachments] = useState<Array<Attachment>>([])
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible)

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream: reload,
    setMessages,
  })

  const sendMessage = async (message: ChatMessage) => {
    await append({
      id: message.id,
      role: message.role,
      content: message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(""),
    })
  }

  const regenerate = async () => {
    if (messages.length === 0) return

    const lastUserMessage = messages.filter((message) => message.role === "user").pop()

    if (lastUserMessage) {
      await reload()
    }
  }

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={isLoading ? "streaming" : "idle"}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={isLoading ? "streaming" : "idle"}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              sendMessage={sendMessage}
              selectedVisibilityType={visibilityType}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={isLoading ? "streaming" : "idle"}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  )
}
