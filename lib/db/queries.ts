import { eq, desc } from "drizzle-orm"
import { db } from "./utils"
import { users, chats, messages, documents, workspaces } from "./schema"

export async function getUser(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email))
  return user
}

export async function createUser(email: string, name?: string) {
  const [user] = await db
    .insert(users)
    .values({
      email,
      name,
    })
    .returning()
  return user
}

export async function getUserChats(userId: string) {
  return await db.select().from(chats).where(eq(chats.userId, userId)).orderBy(desc(chats.updatedAt))
}

export async function getChat(id: string) {
  const [chat] = await db.select().from(chats).where(eq(chats.id, id))
  return chat
}

export async function getChatMessages(chatId: string) {
  return await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt)
}

export async function createChat(userId: string, title: string) {
  const [chat] = await db
    .insert(chats)
    .values({
      userId,
      title,
    })
    .returning()
  return chat
}

export async function saveMessage(chatId: string, role: string, content: string) {
  const [message] = await db
    .insert(messages)
    .values({
      chatId,
      role,
      content,
    })
    .returning()
  return message
}

export async function getUserDocuments(userId: string) {
  return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.updatedAt))
}

export async function createDocument(userId: string, title: string, content?: string) {
  const [document] = await db
    .insert(documents)
    .values({
      userId,
      title,
      content,
    })
    .returning()
  return document
}

export async function getUserWorkspaces(userId: string) {
  return await db.select().from(workspaces).where(eq(workspaces.userId, userId))
}

export async function getHomeWorkspace(userId: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.userId, userId))
    .where(eq(workspaces.isHome, true))
  return workspace
}
