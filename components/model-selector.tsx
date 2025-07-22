"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Sparkles, Eye } from "lucide-react"
import { AVAILABLE_MODELS, type AIModel } from "@/lib/ai/models"
import type { Session } from "next-auth"

const getReasoningIcon = (type?: AIModel["reasoningType"]) => {
  switch (type) {
    case "deep":
      return <Brain className="w-4 h-4" />
    case "analytical":
      return <Zap className="w-4 h-4" />
    case "creative":
      return <Sparkles className="w-4 h-4" />
    case "visual":
      return <Eye className="w-4 h-4" />
    default:
      return <Brain className="w-4 h-4" />
  }
}

export function ModelSelector({
  session,
  selectedModelId,
  onModelChange,
  className,
}: {
  session?: Session
  selectedModelId: string
  onModelChange?: (modelId: string) => void
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId)

  return (
    <div className={className}>
      <Select value={selectedModelId} onValueChange={onModelChange}>
        <SelectTrigger className="w-[200px] bg-gray-900 border-gray-700 text-white">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedModel && getReasoningIcon(selectedModel.reasoningType)}
              <span className="text-sm">{selectedModel?.name || "اختر النموذج"}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700">
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id} className="text-white hover:bg-gray-800">
              <div className="flex flex-col gap-1 py-1">
                <div className="flex items-center gap-2">
                  {getReasoningIcon(model.reasoningType)}
                  <span className="font-medium">{model.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {model.provider}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 text-right">{model.description}</p>
                <div className="flex gap-1 mt-1">
                  {model.capabilities.slice(0, 3).map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
