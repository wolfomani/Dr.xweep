import type { CoreAssistantMessage, CoreToolMessage, UIMessage, UIMessagePart } from "ai"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DBMessage, Document } from "@/lib/db/schema"
import { ChatSDKError, type ErrorCode } from "./errors"
import type { ChatMessage, ChatTools, CustomUIDataTypes } from "./types"
import { formatISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    const { code, cause } = await response.json()
    throw new ChatSDKError(code as ErrorCode, cause)
  }

  return response.json()
}

export async function fetchWithErrorHandlers(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const response = await fetch(input, init)

    if (!response.ok) {
      const { code, cause } = await response.json()
      throw new ChatSDKError(code as ErrorCode, cause)
    }

    return response
  } catch (error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ChatSDKError("offline:chat")
    }

    throw error
  }
}

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]")
  }
  return []
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage
type ResponseMessage = ResponseMessageWithoutId & { id: string }

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === "user")
  return userMessages.at(-1)
}

export function getDocumentTimestampByIndex(documents: Array<Document>, index: number) {
  if (!documents) return new Date()
  if (index > documents.length) return new Date()

  return documents[index].createdAt
}

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>
}): string | null {
  const trailingMessage = messages.at(-1)

  if (!trailingMessage) return null

  return trailingMessage.id
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "")
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }))
}

export function getTextFromMessage(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

// ✅ إضافة الدوال المفقودة
export function getBase64FromDataURL(dataURL: string): string {
  if (!dataURL || typeof dataURL !== "string") {
    throw new Error("Invalid data URL provided")
  }

  const base64Index = dataURL.indexOf(",")
  if (base64Index === -1) {
    throw new Error("Invalid data URL format - missing comma separator")
  }

  return dataURL.substring(base64Index + 1)
}

export function getMediaTypeFromDataURL(dataURL: string): string {
  if (!dataURL || typeof dataURL !== "string") {
    return "application/octet-stream"
  }

  const mediaTypeMatch = dataURL.match(/^data:([^;,]+)/)
  return mediaTypeMatch ? mediaTypeMatch[1] : "application/octet-stream"
}

// دوال إضافية مفيدة للمشروع
export function isValidDataURL(dataURL: string): boolean {
  if (!dataURL || typeof dataURL !== "string") {
    return false
  }

  return /^data:[^;,]+[;,]/.test(dataURL)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}
