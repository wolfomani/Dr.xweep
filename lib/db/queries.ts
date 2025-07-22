import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq, desc, and, gte, sql } from "drizzle-orm"
import {
  users,
  chats,
  messages,
  documents,
  suggestions,
  votes,
  streamIds,
  type User,
  type Chat,
  type Message,
  type Document,
  type Suggestion,
  type Vote,
  type StreamId,
} from "./schema"

// Initialize database connection
const connection = neon(process.env.DATABASE_URL!)
export const db = drizzle(connection)

// User queries
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by id:", error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

export async function createUser(userData: {
  id: string
  email: string
  name?: string
}): Promise<User> {
  try {
    const result = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        name: userData.name || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  try {
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()

    return result[0]
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Chat queries
export async function getChatById({ id }: { id: string }): Promise<Chat> {
  try {
    const result = await db.select().from(chats).where(eq(chats.id, id)).limit(1)
    if (!result[0]) {
      throw new Error("Chat not found")
    }
    return result[0]
  } catch (error) {
    console.error("Error getting chat by id:", error)
    throw error
  }
}

export async function getChatsByUserId({ userId }: { userId: string }): Promise<Chat[]> {
  try {
    return await db.select().from(chats).where(eq(chats.userId, userId)).orderBy(desc(chats.createdAt))
  } catch (error) {
    console.error("Error getting chats by user id:", error)
    throw error
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility = "private",
}: {
  id: string
  userId: string
  title: string
  visibility?: "private" | "public"
}): Promise<Chat> {
  try {
    const result = await db
      .insert(chats)
      .values({
        id,
        userId,
        title,
        visibility,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return result[0]
  } catch (error) {
    console.error("Error saving chat:", error)
    throw error
  }
}

export async function deleteChatById({ id }: { id: string }): Promise<Chat> {
  try {
    // Delete related messages first
    await db.delete(messages).where(eq(messages.chatId, id))

    // Delete the chat
    const result = await db.delete(chats).where(eq(chats.id, id)).returning()
    return result[0]
  } catch (error) {
    console.error("Error deleting chat:", error)
    throw error
  }
}

export async function updateChatTitle({
  id,
  title,
}: {
  id: string
  title: string
}): Promise<Chat> {
  try {
    const result = await db.update(chats).set({ title, updatedAt: new Date() }).where(eq(chats.id, id)).returning()

    return result[0]
  } catch (error) {
    console.error("Error updating chat title:", error)
    throw error
  }
}

// Message queries
export async function getMessagesByChatId({ id }: { id: string }): Promise<Message[]> {
  try {
    return await db.select().from(messages).where(eq(messages.chatId, id)).orderBy(messages.createdAt)
  } catch (error) {
    console.error("Error getting messages by chat id:", error)
    throw error
  }
}

export async function saveMessages({
  messages: messagesToSave,
}: {
  messages: Array<{
    id: string
    chatId: string
    role: "user" | "assistant" | "system"
    parts: any[]
    attachments?: any[]
    createdAt: Date
  }>
}): Promise<Message[]> {
  try {
    const result = await db
      .insert(messages)
      .values(
        messagesToSave.map((msg) => ({
          id: msg.id,
          chatId: msg.chatId,
          role: msg.role,
          parts: msg.parts,
          attachments: msg.attachments || [],
          createdAt: msg.createdAt,
        })),
      )
      .returning()

    return result
  } catch (error) {
    console.error("Error saving messages:", error)
    throw error
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string
  differenceInHours: number
}): Promise<number> {
  try {
    const hoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000)

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .innerJoin(chats, eq(messages.chatId, chats.id))
      .where(and(eq(chats.userId, id), eq(messages.role, "user"), gte(messages.createdAt, hoursAgo)))

    return result[0]?.count || 0
  } catch (error) {
    console.error("Error getting message count:", error)
    throw error
  }
}

// Stream ID queries
export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string
  chatId: string
}): Promise<StreamId> {
  try {
    const result = await db
      .insert(streamIds)
      .values({
        id: streamId,
        chatId,
        createdAt: new Date(),
      })
      .returning()

    return result[0]
  } catch (error) {
    console.error("Error creating stream id:", error)
    throw error
  }
}

export async function saveStreamId({
  streamId,
  chatId,
}: {
  streamId: string
  chatId: string
}): Promise<StreamId> {
  return createStreamId({ streamId, chatId })
}

export async function getStreamIdsByChatId({
  chatId,
}: {
  chatId: string
}): Promise<StreamId[]> {
  try {
    return await db.select().from(streamIds).where(eq(streamIds.chatId, chatId)).orderBy(desc(streamIds.createdAt))
  } catch (error) {
    console.error("Error getting stream ids by chat id:", error)
    throw error
  }
}

// Document queries
export async function getDocumentById({ id }: { id: string }): Promise<Document | null> {
  try {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1)
    return result[0] || null
  } catch (error) {
    console.error("Error getting document by id:", error)
    throw error
  }
}

export async function getDocumentsByUserId({ userId }: { userId: string }): Promise<Document[]> {
  try {
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt))
  } catch (error) {
    console.error("Error getting documents by user id:", error)
    throw error
  }
}

export async function saveDocument({
  id,
  title,
  content,
  userId,
}: {
  id: string
  title: string
  content: string
  userId: string
}): Promise<Document> {
  try {
    const result = await db
      .insert(documents)
      .values({
        id,
        title,
        content,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return result[0]
  } catch (error) {
    console.error("Error saving document:", error)
    throw error
  }
}

export async function updateDocument({
  id,
  title,
  content,
}: {
  id: string
  title?: string
  content?: string
}): Promise<Document> {
  try {
    const updates: Partial<Document> = { updatedAt: new Date() }
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content

    const result = await db.update(documents).set(updates).where(eq(documents.id, id)).returning()

    return result[0]
  } catch (error) {
    console.error("Error updating document:", error)
    throw error
  }
}

export async function deleteDocument({ id }: { id: string }): Promise<Document> {
  try {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning()
    return result[0]
  } catch (error) {
    console.error("Error deleting document:", error)
    throw error
  }
}

// Suggestion queries
export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string
}): Promise<Suggestion[]> {
  try {
    return await db
      .select()
      .from(suggestions)
      .where(eq(suggestions.documentId, documentId))
      .orderBy(desc(suggestions.createdAt))
  } catch (error) {
    console.error("Error getting suggestions by document id:", error)
    throw error
  }
}

export async function saveSuggestions({
  suggestions: suggestionsToSave,
}: {
  suggestions: Array<{
    id: string
    documentId: string
    originalText: string
    suggestedText: string
    description?: string
    isResolved?: boolean
  }>
}): Promise<Suggestion[]> {
  try {
    const result = await db
      .insert(suggestions)
      .values(
        suggestionsToSave.map((suggestion) => ({
          id: suggestion.id,
          documentId: suggestion.documentId,
          originalText: suggestion.originalText,
          suggestedText: suggestion.suggestedText,
          description: suggestion.description || null,
          isResolved: suggestion.isResolved || false,
          createdAt: new Date(),
        })),
      )
      .returning()

    return result
  } catch (error) {
    console.error("Error saving suggestions:", error)
    throw error
  }
}

// Vote queries
export async function getVotesByChatId({ chatId }: { chatId: string }): Promise<Vote[]> {
  try {
    return await db.select().from(votes).where(eq(votes.chatId, chatId)).orderBy(desc(votes.createdAt))
  } catch (error) {
    console.error("Error getting votes by chat id:", error)
    throw error
  }
}

export async function saveVote({
  chatId,
  messageId,
  isUpvoted,
}: {
  chatId: string
  messageId: string
  isUpvoted: boolean
}): Promise<Vote> {
  try {
    const result = await db
      .insert(votes)
      .values({
        id: crypto.randomUUID(),
        chatId,
        messageId,
        isUpvoted,
        createdAt: new Date(),
      })
      .returning()

    return result[0]
  } catch (error) {
    console.error("Error saving vote:", error)
    throw error
  }
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    await db.select().from(users).limit(1)
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

// Export all functions
export default {
  // Users
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,

  // Chats
  getChatById,
  getChatsByUserId,
  saveChat,
  deleteChatById,
  updateChatTitle,

  // Messages
  getMessagesByChatId,
  saveMessages,
  getMessageCountByUserId,

  // Stream IDs
  createStreamId,
  saveStreamId,
  getStreamIdsByChatId,

  // Documents
  getDocumentById,
  getDocumentsByUserId,
  saveDocument,
  updateDocument,
  deleteDocument,

  // Suggestions
  getSuggestionsByDocumentId,
  saveSuggestions,

  // Votes
  getVotesByChatId,
  saveVote,

  // Health
  healthCheck,
}
