"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, CheckCircle, AlertTriangle, Calculator, Eye, Lightbulb } from "lucide-react"

interface ReasoningStep {
  type: "تفكير" | "خطوة" | "تأمل" | "مكافأة" | "معادلة" | "تحقق" | "تأكيد" | "إجابة"
  content: string
  stepNumber?: number
  remainingSteps?: number
  reward?: number
  confidence?: number
}

interface ReasoningDisplayProps {
  steps: ReasoningStep[]
  isComplete: boolean
}

const getStepIcon = (type: ReasoningStep["type"]) => {
  switch (type) {
    case "تفكير":
      return <Brain className="w-4 h-4 text-purple-500" />
    case "خطوة":
      return <CheckCircle className="w-4 h-4 text-blue-500" />
    case "تأمل":
      return <Eye className="w-4 h-4 text-green-500" />
    case "مكافأة":
      return <Lightbulb className="w-4 h-4 text-yellow-500" />
    case "معادلة":
      return <Calculator className="w-4 h-4 text-red-500" />
    case "تحقق":
      return <AlertTriangle className="w-4 h-4 text-orange-500" />
    case "تأكيد":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "إجابة":
      return <CheckCircle className="w-4 h-4 text-emerald-600" />
    default:
      return <Brain className="w-4 h-4" />
  }
}

const getStepColor = (type: ReasoningStep["type"]) => {
  switch (type) {
    case "تفكير":
      return "border-l-purple-500 bg-purple-50 dark:bg-purple-950"
    case "خطوة":
      return "border-l-blue-500 bg-blue-50 dark:bg-blue-950"
    case "تأمل":
      return "border-l-green-500 bg-green-50 dark:bg-green-950"
    case "مكافأة":
      return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950"
    case "معادلة":
      return "border-l-red-500 bg-red-50 dark:bg-red-950"
    case "تحقق":
      return "border-l-orange-500 bg-orange-50 dark:bg-orange-950"
    case "تأكيد":
      return "border-l-green-600 bg-green-100 dark:bg-green-900"
    case "إجابة":
      return "border-l-emerald-600 bg-emerald-100 dark:bg-emerald-900"
    default:
      return "border-l-gray-500 bg-gray-50 dark:bg-gray-950"
  }
}

export function ReasoningDisplay({ steps, isComplete }: ReasoningDisplayProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSteps(newExpanded)
  }

  const averageReward =
    steps.filter((step) => step.reward !== undefined).reduce((sum, step) => sum + (step.reward || 0), 0) /
    steps.filter((step) => step.reward !== undefined).length

  const completedSteps = steps.filter((step) => step.type === "خطوة").length
  const totalSteps = Math.max(...steps.map((step) => step.remainingSteps || 0)) + completedSteps

  return (
    <Card className="mt-4 border-l-4 border-l-indigo-500" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          مسار التفكير المتقدم
          {isComplete && <Badge variant="secondary">مكتمل</Badge>}
        </CardTitle>
        {totalSteps > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                التقدم: {completedSteps}/{totalSteps}
              </span>
              <span>متوسط الأداء: {(averageReward * 100).toFixed(0)}%</span>
            </div>
            <Progress value={(completedSteps / totalSteps) * 100} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className={`border-l-4 rounded-lg p-3 ${getStepColor(step.type)}`}>
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleStep(index)}>
              <div className="flex items-center gap-2">
                {getStepIcon(step.type)}
                <span className="font-medium text-sm">{step.type}</span>
                {step.stepNumber && <Badge variant="outline">#{step.stepNumber}</Badge>}
                {step.remainingSteps !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    متبقي: {step.remainingSteps}
                  </Badge>
                )}
                {step.reward !== undefined && (
                  <Badge
                    variant={step.reward >= 0.8 ? "default" : step.reward >= 0.5 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {(step.reward * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </div>

            {(expandedSteps.has(index) || step.type === "إجابة") && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-sm whitespace-pre-wrap">{step.content}</div>
              </div>
            )}
          </div>
        ))}

        {isComplete && (
          <div className="mt-4 p-4 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">ملخص الأداء</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-700 dark:text-emerald-300">إجمالي الخطوات:</span>
                <span className="font-medium mr-2">{steps.length}</span>
              </div>
              <div>
                <span className="text-emerald-700 dark:text-emerald-300">متوسط الأداء:</span>
                <span className="font-medium mr-2">{(averageReward * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
