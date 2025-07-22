"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Sparkles, Eye, Gauge } from "lucide-react"
import { AVAILABLE_MODELS, type AIModel } from "@/lib/ai/models"

const getReasoningIcon = (type?: AIModel["reasoningType"]) => {
  switch (type) {
    case "deep":
      return <Brain className="w-4 h-4 text-purple-400" />
    case "analytical":
      return <Zap className="w-4 h-4 text-blue-400" />
    case "creative":
      return <Sparkles className="w-4 h-4 text-yellow-400" />
    case "visual":
      return <Eye className="w-4 h-4 text-green-400" />
    case "versatile":
      return <Gauge className="w-4 h-4 text-orange-400" />
    default:
      return <Brain className="w-4 h-4" />
  }
}

const getProviderColor = (provider: string) => {
  switch (provider) {
    case "groq":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    case "deepseek":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "together":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function ModelSelector({
  selectedModelId,
  onModelChange,
  className,
}: {
  selectedModelId: string
  onModelChange?: (modelId: string) => void
  className?: string
}) {
  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId)

  return (
    <div className={className}>
      <Select value={selectedModelId} onValueChange={onModelChange}>
        <SelectTrigger className="w-[250px] bg-gray-900 border-gray-700 text-white">
          <SelectValue>
            <div className="flex items-center gap-2">
              {selectedModel && getReasoningIcon(selectedModel.reasoningType)}
              <span className="text-sm">{selectedModel?.name || "اختر النموذج"}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700 max-h-80">
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id} className="text-white hover:bg-gray-800">
              <div className="flex flex-col gap-2 py-2">
                <div className="flex items-center gap-2">
                  {getReasoningIcon(model.reasoningType)}
                  <span className="font-medium">{model.name}</span>
                  <Badge variant="secondary" className={`text-xs ${getProviderColor(model.provider)}`}>
                    {model.provider}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 text-right max-w-[200px]">{model.description}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {model.capabilities.slice(0, 3).map((cap) => (
                    <Badge key={cap} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    {Math.round(model.maxTokens / 1000)}K tokens
                  </Badge>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
