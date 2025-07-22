"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Zap, Brain, Sparkles, Bot } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getAvailableModels, type ModelId } from "@/lib/ai/models"

interface ModelSelectorProps {
  selectedModel: ModelId
  onModelChange: (model: ModelId) => void
}

const providerIcons = {
  deepseek: Brain,
  groq: Zap,
  together: Sparkles,
  google: Bot,
}

const providerColors = {
  deepseek: "text-blue-500",
  groq: "text-orange-500",
  together: "text-purple-500",
  google: "text-green-500",
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const models = getAvailableModels()
  const currentModel = models.find((model) => model.id === selectedModel)

  // تجميع النماذج حسب المزود
  const modelsByProvider = models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    },
    {} as Record<string, typeof models>,
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between bg-transparent"
        >
          {currentModel ? (
            <div className="flex items-center gap-2">
              {React.createElement(providerIcons[currentModel.provider as keyof typeof providerIcons], {
                className: `h-4 w-4 ${providerColors[currentModel.provider as keyof typeof providerColors]}`,
              })}
              <span className="truncate">{currentModel.name}</span>
            </div>
          ) : (
            "اختر النموذج..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="البحث عن النماذج..." />
          <CommandList>
            <CommandEmpty>لم يتم العثور على نماذج.</CommandEmpty>
            {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
              <CommandGroup key={provider} heading={provider.toUpperCase()}>
                {providerModels.map((model) => {
                  const Icon = providerIcons[model.provider as keyof typeof providerIcons]
                  return (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={(currentValue) => {
                        onModelChange(currentValue as ModelId)
                        setOpen(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedModel === model.id ? "opacity-100" : "opacity-0")} />
                      <Icon
                        className={`mr-2 h-4 w-4 ${providerColors[model.provider as keyof typeof providerColors]}`}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.maxTokens} tokens • {model.supportsImages ? "صور ✓" : "نص فقط"}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
