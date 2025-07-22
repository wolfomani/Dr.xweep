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

export function getBase64FromDataURL(dataURL: string): string {
  const base64Index = dataURL.indexOf(",") + 1
  return dataURL.substring(base64Index)
}

export function getMediaTypeFromDataURL(dataURL: string): string {
  const mediaTypeMatch = dataURL.match(/^data:([^;]+)/)
  return mediaTypeMatch ? mediaTypeMatch[1] : "application/octet-stream"
}

export function formatDate(date: Date | string | number): string {
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatTime(date: Date | string | number): string {
  const dateObj = new Date(date)
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + "..."
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

export function parseJSON<T>(value: string | null): T | null {
  try {
    return value === "undefined" ? null : JSON.parse(value ?? "")
  } catch {
    return null
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

export function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function groupBy<T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = key(item)
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<K, T[]>,
  )
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function uniqueBy<T, K>(array: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>()
  return array.filter((item) => {
    const k = key(item)
    if (seen.has(k)) {
      return false
    }
    seen.add(k)
    return true
  })
}

export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function isEmpty(value: any): boolean {
  if (value == null) return true
  if (typeof value === "string" || Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value).length === 0
  return false
}

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }

  if (typeof a === "object") {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) => isEqual(a[key], b[key]))
  }

  return false
}
