export interface ReasoningGoal {
  type: "analysis" | "problem_solving" | "visual_explanation" | "step_by_step" | "mathematical" | "creative"
  description: string
  language: "ar" | "en"
  complexity: "simple" | "medium" | "complex" | "expert"
}

export const buildAdvancedReasoningPrompt = (messages: any[], goal: ReasoningGoal) => {
  const complexityInstructions = {
    ar: {
      simple: "استخدم 5-8 خطوات للحل",
      medium: "استخدم 10-15 خطوة للحل",
      complex: "استخدم 15-20 خطوة للحل",
      expert: "استخدم 20+ خطوة مع تحليل عميق",
    },
    en: {
      simple: "Use 5-8 steps for the solution",
      medium: "Use 10-15 steps for the solution",
      complex: "Use 15-20 steps for the solution",
      expert: "Use 20+ steps with deep analysis",
    },
  }

  const typeInstructions = {
    ar: {
      analysis: "🔍 ركز على التحليل العميق والفهم الشامل",
      problem_solving: "🧩 ركز على إيجاد حلول عملية ومنطقية",
      visual_explanation: "👁️ ركز على الشرح المرئي والتوضيح",
      step_by_step: "📋 ركز على التسلسل المنطقي للخطوات",
      mathematical: "🧮 ركز على الدقة الرياضية والبراهين",
      creative: "✨ ركز على الإبداع والابتكار",
    },
    en: {
      analysis: "🔍 Focus on deep analysis and comprehensive understanding",
      problem_solving: "🧩 Focus on finding practical and logical solutions",
      visual_explanation: "👁️ Focus on visual explanation and clarification",
      step_by_step: "📋 Focus on logical sequence of steps",
      mathematical: "🧮 Focus on mathematical precision and proofs",
      creative: "✨ Focus on creativity and innovation",
    },
  }

  const lang = goal.language
  const instruction = typeInstructions[lang][goal.type]
  const complexity = complexityInstructions[lang][goal.complexity]

  return [
    {
      role: "system",
      content: `${instruction}\n${complexity}\n\n${goal.description}`,
    },
    ...messages,
  ]
}

export const REASONING_TEMPLATES = {
  mathematical: {
    ar: `
<تفكير>
المسألة الرياضية تتطلب تحليل دقيق للمعطيات والمطلوب.
</تفكير>

<خطوة>
الخطوة 1: تحديد المعطيات والمطلوب
<عدد>19</عدد>
</خطوة>

<معادلة>
$$المعادلة الأساسية$$
</معادلة>

<تأمل>
هل المعادلة صحيحة؟ هل المنطق سليم؟
</تأمل>

<مكافأة>0.8</مكافأة>
    `,
    en: `
<Thinking>
The mathematical problem requires precise analysis of given data and requirements.
</Thinking>

<step>
Step 1: Identify given data and requirements
<count>19</count>
</step>

<equation>
$$Basic equation$$
</equation>

<reflection>
Is the equation correct? Is the logic sound?
</reflection>

<reward>0.8</reward>
    `,
  },
  problem_solving: {
    ar: `
<تفكير>
المشكلة تحتاج إلى فهم عميق وتحليل شامل قبل البدء في الحل.
</تفكير>

<خطوة>
الخطوة 1: تحليل المشكلة وتحديد العوامل المؤثرة
<عدد>15</عدد>
</خطوة>

<تأمل>
هل فهمت المشكلة بشكل صحيح؟ هل هناك عوامل مخفية؟
</تأمل>

<مكافأة>0.7</مكافأة>
    `,
  },
}
