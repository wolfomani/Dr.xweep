import { streamText } from "ai"
import { getModel, type ModelId } from "@/lib/ai/models"

export async function POST(req: Request) {
  try {
    const { messages, model: modelId } = await req.json()

    if (!modelId || !messages) {
      return new Response("Missing required fields", { status: 400 })
    }

    const modelConfig = getModel(modelId as ModelId)

    if (!modelConfig) {
      return new Response("Invalid model", { status: 400 })
    }

    // التحقق من توفر مفاتيح API
    const requiredEnvVars = {
      deepseek: process.env.DEEPSEEK_API_KEY,
      groq: process.env.GROQ_API_KEY,
      together: process.env.TOGETHER_API_KEY,
      google: process.env.GEMINI_API_KEY,
    }

    if (!requiredEnvVars[modelConfig.provider as keyof typeof requiredEnvVars]) {
      return new Response(`API key not configured for ${modelConfig.provider}`, { status: 400 })
    }

    const result = await streamText({
      model: modelConfig.model,
      messages: [
        {
          role: "system",
          content: `أنت "دكتور إكس" - مساعد ذكي متطور ومتعدد اللغات. 
          
          🎯 مهامك:
          - التحدث بالعربية والإنجليزية بطلاقة
          - تقديم إجابات دقيقة ومفيدة ومبدعة
          - مساعدة المستخدمين في جميع المجالات
          - التفكير النقدي والتحليل العميق
          
          💡 أسلوبك:
          - مهذب ومحترف
          - واضح ومفصل
          - مبدع ومبتكر
          - داعم ومشجع
          
          You are "Dr. X" - an advanced multilingual AI assistant.
          Be helpful, creative, and provide detailed, accurate responses in both Arabic and English.`,
        },
        ...messages,
      ],
      maxTokens: modelConfig.maxTokens,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)

    // معالجة أخطاء محددة
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return new Response("مفتاح API غير صحيح أو منتهي الصلاحية", { status: 401 })
      }
      if (error.message.includes("rate limit")) {
        return new Response("تم تجاوز حد الاستخدام، يرجى المحاولة لاحقاً", { status: 429 })
      }
    }

    return new Response("خطأ في الخادم الداخلي", { status: 500 })
  }
}
