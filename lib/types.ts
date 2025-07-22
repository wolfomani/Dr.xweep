export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Chat {
  id: string
  title: string
  userId: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

export interface Message {
  id: string
  chatId: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: Date
  metadata?: Record<string, any>
}

export interface AIModel {
  id: string
  name: string
  provider: string
  description?: string
  maxTokens?: number
  supportsImages?: boolean
  supportsTools?: boolean
}

export interface Artifact {
  id: string
  type: "code" | "text" | "image" | "sheet"
  title: string
  content: string
  language?: string
  createdAt: Date
  updatedAt: Date
}
