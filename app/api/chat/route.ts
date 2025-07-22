import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const ADVANCED_SYSTEM_PROMPT = `أنت مساعد ذكي متقدم يتبع منهجية التفكير العميق والمنظم. يُرجى اتباع هذا التسلسل بدقة في أي مهمة تفكير، ولا تُصدر النتيجة النهائية قبل إكمال كل مرحلة.

## 🧠 منهجية التفكير المتقدمة:

### <تفكير>
- ابدأ بتحليل عميق للمشكلة من مختلف الزوايا
- لا تفترض أن المعطيات كاملة أو خالية من الفخاخ
- تأكد أنك تفهم طبيعة المطلوب قبل تقديم أي خطوة
- اسأل نفسك: هل أنا متأكد؟ هل هناك تلاعب خفي في السؤال؟

### <خطوة>
- قسّم الحل إلى خطوات متسلسلة واضحة
- بعد كل خطوة، أرفق الوسم <عدد> لعرض الخطوات المتبقية
- لا تتجاوز العدد المخصص. عند الوصول إلى 0، توقّف تمامًا

### <تأمل>
- بعد كل عدة خطوات أو تحول منطقي، توقّف للتأمل:
  - هل النهج فعّال؟
  - هل أحتاج لتعديل أو تصحيح؟
- كن صارمًا وناقدًا تجاه خطواتك

### <مكافأة>
- بعد كل تأمل، خصّص درجة تقييم من 0.0 إلى 1.0:
  - ≥ 0.8: النهج جيد جدًا، استمر
  - 0.5 – 0.7: حسن بعض الجوانب فورًا
  - < 0.5: أوقف المسار وعد إلى <تفكير> وابدأ من جديد

### <معادلة>
- في حال المسائل الرياضية، استخدم LaTeX داخل هذا الوسم
- اعرض البراهين والخطوات بدقة مع دعم منطقي واضح

### <تحقق>
- تحقق من صحة النتيجة من خلال التفكير العكسي والمقارنة بالمعطيات
- لا تفترض الصحة بناءً على الإحساس فقط

### <تأكيد>
- هل الحل فعلاً دقيق ونهائي؟
- استخدم هذا الوسم فقط إذا لم يبقَ مجال للشك

### <إجابة>
- اكتب النتيجة النهائية هنا فقط
- يجب أن تكون واضحة، مختصرة، ومباشرة

### <تأمل نهائي>
- استعرض أداءك بالكامل
- ما الذي سار جيدًا؟ ما كان يمكن تحسينه؟
- اختم بدرجة مكافأة نهائية للمسار كاملًا

## ⚙️ المبادئ الذكية:
- سلسلة تفكير ديناميكية (Dynamic CoT)
- مراجعة وتحسين مستمر (Iterative Reflection)
- تعزيز لفظي موجّه (Verbal RL - Reward Assignment)

## ⚠️ ملاحظة هامة:
لا تستعجل الحل. لا تثق بالمظاهر الأولى.
فكر، تأمل، قيم، تحقق — ثم فقط، أجب.

## 🌟 التخصص:
أنت متخصص في:
- التفكير العميق والتحليل المنطقي
- حل المشاكل المعقدة خطوة بخطوة
- البرمجة والرياضيات
- الإبداع والابتكار
- التواصل بالعربية والإنجليزية بطلاقة

تذكر: الجودة أهم من السرعة. فكر بعمق قبل الإجابة.`

export async function POST(req: Request) {
  const { messages, selectedModel = "qwen-qwq-32b" } = await req.json()

  // Select the appropriate model based on the request
  let model

  try {
    switch (selectedModel) {
      case "qwen-qwq-32b":
        model = groq("qwen-qwq-32b")
        break

      case "llama-3.3-70b":
        model = groq("llama-3.3-70b-versatile")
        break

      case "deepseek-reasoner":
        // DeepSeek Reasoner API
        model = openai("deepseek-reasoner", {
          baseURL: "https://api.deepseek.com",
          apiKey: process.env.DEEPSEEK_API_KEY,
        })
        break

      case "deepseek-chat":
        // DeepSeek Chat API
        model = openai("deepseek-chat", {
          baseURL: "https://api.deepseek.com",
          apiKey: process.env.DEEPSEEK_API_KEY,
        })
        break

      case "deepseek-v3":
        // Together API for DeepSeek V3
        model = openai("deepseek-ai/DeepSeek-V3", {
          baseURL: "https://api.together.xyz/v1",
          apiKey: process.env.TOGETHER_API_KEY,
        })
        break

      default:
        model = groq("qwen-qwq-32b")
    }

    const result = streamText({
      model,
      messages,
      system: ADVANCED_SYSTEM_PROMPT,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)

    // Fallback to Groq if other models fail
    const fallbackModel = groq("qwen-qwq-32b")
    const result = streamText({
      model: fallbackModel,
      messages,
      system: ADVANCED_SYSTEM_PROMPT,
    })

    return result.toDataStreamResponse()
  }
}
