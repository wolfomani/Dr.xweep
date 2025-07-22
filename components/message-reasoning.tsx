"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Brain, Eye, Lightbulb, CheckCircle } from "lucide-react"

interface ReasoningStep {
  id: string
  type: "analysis" | "reasoning" | "conclusion" | "verification"
  title: string
  content: string
  confidence?: number
  timestamp: Date
}

interface ReasoningPath {
  id: string
  goal: string
  steps: ReasoningStep[]
  finalAnswer: string
  reasoningType: "deep" | "visual" | "chain_of_thought"
  language: "ar" | "en"
}

interface MessageReasoningProps {
  reasoningPath: ReasoningPath
  isVisible: boolean
  onToggle: () => void
}

const getStepIcon = (type: ReasoningStep["type"]) => {
  switch (type) {
    case "analysis":
      return <Eye className="w-4 h-4" />
    case "reasoning":
      return <Brain className="w-4 h-4" />
    case "conclusion":
      return <CheckCircle className="w-4 h-4" />
    case "verification":
      return <Lightbulb className="w-4 h-4" />
    default:
      return <Brain className="w-4 h-4" />
  }
}

const getStepColor = (type: ReasoningStep["type"]) => {
  switch (type) {
    case "analysis":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "reasoning":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    case "conclusion":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "verification":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

const getReasoningTypeLabel = (type: ReasoningPath["reasoningType"], language: "ar" | "en") => {
  const labels = {
    ar: {
      deep: "تفكير عميق",
      visual: "تحليل مرئي",
      chain_of_thought: "تفكير متسلسل",
    },
    en: {
      deep: "Deep Reasoning",
      visual: "Visual Analysis",
      chain_of_thought: "Chain of Thought",
    },
  }
  return labels[language][type]
}

export function MessageReasoning({ reasoningPath, isVisible, onToggle }: MessageReasoningProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const { language, reasoningType, goal, steps, finalAnswer } = reasoningPath

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const isRTL = language === "ar"

  return (
    <div className={`mt-4 ${isRTL ? "rtl" : "ltr"}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <Brain className="w-4 h-4" />
        <span>{isRTL ? "مسار التفكير" : "Reasoning Path"}</span>
        {isVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isVisible && (
        <Card className="mt-2 border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {isRTL ? "تحليل التفكير" : "Reasoning Analysis"}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {getReasoningTypeLabel(reasoningType, language)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>{isRTL ? "الهدف:" : "Goal:"}</strong> {goal}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Reasoning Steps */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {isRTL ? "خطوات التفكير:" : "Reasoning Steps:"}
              </h4>

              {steps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleStep(step.id)}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getStepColor(step.type)}`}>
                        {getStepIcon(step.type)}
                        <span className="ml-1">{index + 1}</span>
                      </Badge>
                      <span className="font-medium text-sm">{step.title}</span>
                      {step.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(step.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    {expandedSteps.has(step.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>

                  {expandedSteps.has(step.id) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{step.content}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {step.timestamp.toLocaleTimeString(isRTL ? "ar" : "en")}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Final Answer */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                {isRTL ? "الإجابة النهائية:" : "Final Answer:"}
              </h4>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm whitespace-pre-wrap">{finalAnswer}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook for managing reasoning visibility
export function useReasoningVisibility() {
  const [visibleReasoning, setVisibleReasoning] = useState<Set<string>>(new Set())

  const toggleReasoning = (messageId: string) => {
    const newVisible = new Set(visibleReasoning)
    if (newVisible.has(messageId)) {
      newVisible.delete(messageId)
    } else {
      newVisible.add(messageId)
    }
    setVisibleReasoning(newVisible)
  }

  const isReasoningVisible = (messageId: string) => visibleReasoning.has(messageId)

  return { toggleReasoning, isReasoningVisible }
}
