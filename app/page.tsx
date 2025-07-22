"use client"

import type React from "react"
import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModelSelector } from "@/components/model-selector"
import { Send, Lightbulb, MessageSquare, ImageIcon, Languages, PenTool, ChefHat, Settings } from "lucide-react"
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models"

const suggestions = [
  {
    id: "advice",
    text: "نصيحة عملية",
    icon: <Lightbulb className="w-4 h-4" />,
    prompt: "أعطني نصيحة عملية مفيدة",
  },
  {
    id: "ideas",
    text: "اقتراح أفكار",
    icon: <MessageSquare className="w-4 h-4" />,
    prompt: "اقترح علي بعض الأفكار الإبداعية",
  },
  {
    id: "image",
    text: "إنشاء صورة",
    icon: <ImageIcon className="w-4 h-4" />,
    prompt: "ساعدني في إنشاء وصف لصورة",
  },
  {
    id: "translation",
    text: "الترجمة",
    icon: <Languages className="w-4 h-4" />,
    prompt: "ساعدني في الترجمة",
  },
  {
    id: "writing",
    text: "مساعدة في الكتابة",
    icon: <PenTool className="w-4 h-4" />,
    prompt: "ساعدني في الكتابة والتحرير",
  },
  {
    id: "cooking",
    text: "تحضير الطعام",
    icon: <ChefHat className="w-4 h-4" />,
    prompt: "اقترح علي وصفة طعام لذيذة",
  },
]

export default function Page() {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CHAT_MODEL)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    body: { selectedModel },
  })

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
    setHasStarted(true)
  }

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e)
    setHasStarted(true)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" dir="rtl">
      {/* Model Selector Toggle */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowModelSelector(!showModelSelector)}
          className="text-gray-400 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </Button>
        {showModelSelector && (
          <div className="mt-2">
            <ModelSelector selectedModelId={selectedModel} onModelChange={setSelectedModel} />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8">
        {!hasStarted && messages.length === 0 ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-2xl font-semibold mb-8">كيف يمكنني المساعدة؟</h1>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="outline"
                    className="h-auto p-4 border-gray-600 bg-transparent hover:bg-gray-800 text-white border-opacity-50 flex items-center gap-2 text-sm"
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                  >
                    {suggestion.icon}
                    <span>{suggestion.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full max-w-2xl space-y-4 mb-8">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <form onSubmit={onSubmit} className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-gray-600"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-gray-700 hover:bg-gray-600 text-white"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
