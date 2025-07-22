export interface ReasoningGoal {
  type: "analysis" | "problem_solving" | "visual_explanation" | "step_by_step"
  description: string
  language: "ar" | "en"
}

export const buildDeepReasoningPrompt = (messages: any[], goal: ReasoningGoal) => {
  const systemPrompts = {
    ar: {
      analysis: "أنت مساعد ذكي متخصص في التحليل العميق. تتبع خطوات تفكير واضحة ومنظمة وتقدم تفسيرات مفصلة.",
      problem_solving: "أنت مساعد ذكي متخصص في حل المشاكل. تحلل المشكلة خطوة بخطوة وتقدم حلول منطقية ومدروسة.",
      visual_explanation: "أنت مساعد ذكي متخصص في التفسير المرئي. تحلل الصور والمحتوى المرئي وتقدم شرح مفصل.",
      step_by_step: "أنت مساعد ذكي يتبع منهجية خطوة بخطوة في التفكير والتحليل.",
    },
    en: {
      analysis:
        "You are an intelligent assistant specialized in deep analysis. You follow clear and organized thinking steps and provide detailed explanations.",
      problem_solving:
        "You are an intelligent assistant specialized in problem solving. You analyze problems step by step and provide logical and thoughtful solutions.",
      visual_explanation:
        "You are an intelligent assistant specialized in visual explanation. You analyze images and visual content and provide detailed explanations.",
      step_by_step:
        "You are an intelligent assistant that follows a step-by-step methodology in thinking and analysis.",
    },
  }

  const reasoningInstructions = {
    ar: {
      start: "لنبدأ التفكير خطوة بخطوة:",
      analyze: "🔍 التحليل:",
      reasoning: "🧠 التفكير:",
      conclusion: "✅ الخلاصة:",
      steps: "📋 الخطوات:",
    },
    en: {
      start: "Let's start thinking step by step:",
      analyze: "🔍 Analysis:",
      reasoning: "🧠 Reasoning:",
      conclusion: "✅ Conclusion:",
      steps: "📋 Steps:",
    },
  }

  const lang = goal.language
  const instructions = reasoningInstructions[lang]

  return [
    {
      role: "system",
      content: systemPrompts[lang][goal.type],
    },
    {
      role: "user",
      content: lang === "ar" ? `الهدف: ${goal.description}` : `Goal: ${goal.description}`,
    },
    ...messages,
    {
      role: "assistant",
      content: `${instructions.start}\n\n${instructions.analyze}\n${instructions.reasoning}\n${instructions.conclusion}`,
    },
  ]
}

export const buildVisualReasoningPrompt = (imageData: string, question: string, language: "ar" | "en" = "ar") => {
  const prompts = {
    ar: {
      system: "أنت مساعد ذكي متخصص في التحليل المرئي. تحلل الصور بدقة وتقدم تفسيرات مفصلة ومنطقية.",
      instruction:
        "حلل هذه الصورة بعناية واتبع هذه الخطوات:\n1. 👁️ الوصف المرئي\n2. 🔍 التحليل التفصيلي\n3. 🧠 الاستنتاجات\n4. 💡 الملاحظات المهمة",
    },
    en: {
      system:
        "You are an intelligent assistant specialized in visual analysis. You analyze images accurately and provide detailed and logical explanations.",
      instruction:
        "Analyze this image carefully and follow these steps:\n1. 👁️ Visual Description\n2. 🔍 Detailed Analysis\n3. 🧠 Conclusions\n4. 💡 Important Observations",
    },
  }

  return [
    { role: "system", content: prompts[language].system },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `${prompts[language].instruction}\n\n${language === "ar" ? "السؤال" : "Question"}: ${question}`,
        },
        { type: "image_url", image_url: { url: imageData } },
      ],
    },
  ]
}

export const buildChainOfThoughtPrompt = (problem: string, language: "ar" | "en" = "ar") => {
  const templates = {
    ar: {
      system: "أنت مساعد ذكي يستخدم منهجية Chain of Thought للتفكير المنطقي المتسلسل.",
      template: `
المشكلة: ${problem}

سأحل هذه المشكلة خطوة بخطوة:

🎯 فهم المشكلة:
- ما هو المطلوب؟
- ما هي المعطيات؟

🔄 خطوات الحل:
1. الخطوة الأولى:
2. الخطوة الثانية:
3. الخطوة الثالثة:

🧮 التطبيق:
- تطبيق الخطوات عملياً

✅ التحقق من النتيجة:
- هل النتيجة منطقية؟
- هل تجيب على السؤال؟

🎉 الإجابة النهائية:
      `,
    },
    en: {
      system:
        "You are an intelligent assistant that uses Chain of Thought methodology for sequential logical thinking.",
      template: `
Problem: ${problem}

I will solve this problem step by step:

🎯 Understanding the Problem:
- What is required?
- What are the given data?

🔄 Solution Steps:
1. First step:
2. Second step:
3. Third step:

🧮 Application:
- Applying the steps practically

✅ Verification:
- Is the result logical?
- Does it answer the question?

🎉 Final Answer:
      `,
    },
  }

  return [
    { role: "system", content: templates[language].system },
    { role: "user", content: templates[language].template },
  ]
}
