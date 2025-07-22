import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from "nanoid"
import type { Message } from "ai"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7)

export function generateUUID(): string {
  return nanoid()
}

export function getBase64FromDataURL(dataURL: string): string {
  try {
    if (!dataURL || typeof dataURL !== "string") {
      throw new Error("Invalid data URL")
    }

    const base64Index = dataURL.indexOf(",")
    if (base64Index === -1) {
      throw new Error("Invalid data URL format")
    }

    return dataURL.substring(base64Index + 1)
  } catch (error) {
    console.error("Error extracting base64 from data URL:", error)
    return ""
  }
}

export function getMediaTypeFromDataURL(dataURL: string): string {
  try {
    if (!dataURL || typeof dataURL !== "string") {
      return "application/octet-stream"
    }

    const match = dataURL.match(/^data:([^;]+);/)
    return match ? match[1] : "application/octet-stream"
  } catch (error) {
    console.error("Error extracting media type from data URL:", error)
    return "application/octet-stream"
  }
}

export function convertToUIMessages(messages: Array<any>): Message[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content || "",
    parts: message.parts || [],
    createdAt: message.createdAt,
  }))
}

export function sanitizeResponseMessages(messages: Array<any>): Array<any> {
  const messagesBySender = messages.reduce(
    (acc, message) => {
      if (!acc[message.role]) {
        acc[message.role] = []
      }
      acc[message.role].push(message)
      return acc
    },
    {} as Record<string, Array<any>>,
  )

  const sanitizedMessages = []

  for (const role of ["user", "assistant"]) {
    if (messagesBySender[role]) {
      sanitizedMessages.push(...messagesBySender[role])
    }
  }

  return sanitizedMessages
}

export function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === "user")
  return userMessages.at(-1)
}

export function getDocumentTimestampByIndex(documents: Array<any>, index: number) {
  if (!documents[index]) {
    return new Date()
  }

  return documents[index].createdAt
}

export function getMessageIdFromAnnotations(message: Message) {
  if (!message.annotations) return message.id

  const [annotation] = message.annotations
  if (!annotation) return message.id

  return (annotation as any).messageIdFromServer || message.id
}

export function formatDate(date: Date | string | number): string {
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

export function formatTime(date: Date | string | number): string {
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return "Invalid Time"
    }

    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting time:", error)
    return "Invalid Time"
  }
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
