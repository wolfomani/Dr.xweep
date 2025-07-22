"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelSelector } from "@/components/model-selector"
import type { ModelId } from "@/lib/ai/models"
import { Send, Bot, User, Sparkles, Moon, Sun, AlertCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "@/hooks/use-toast"

export function Chat() {
  const [selectedModel, setSelectedModel] = useState<ModelId>("deepseek-chat")
  const { theme, setTheme } = useTheme()

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
    },
    onError: (error) => {
      toast({
        title: "خطأ في الدردشة",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>دكتور إكس - Dr.X AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">تبديل الثيم</span>
              </Button>
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>خطأ: {error.message}</span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="mx-auto h-12 w-12 mb-4 text-primary" />
              <p className="text-lg mb-2">مرحباً! أنا دكتور إكس، مساعدك الذكي</p>
              <p className="text-sm mb-6">Hello! I'm Dr. X, your AI assistant</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <h3 className="font-medium mb-2">🧠 تحليل وتفكير</h3>
                  <p className="text-sm text-muted-foreground">تحليل المشاكل والتفكير النقدي</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <h3 className="font-medium mb-2">💻 البرمجة والتقنية</h3>
                  <p className="text-sm text-muted-foreground">مساعدة في الكود والتطوير</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <h3 className="font-medium mb-2">📝 الكتابة والتحرير</h3>
                  <p className="text-sm text-muted-foreground">تحسين النصوص والمحتوى</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <h3 className="font-medium mb-2">🎓 التعلم والتعليم</h3>
                  <p className="text-sm text-muted-foreground">شرح المفاهيم والمساعدة في الدراسة</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  {message.role === "user" ? (
                    <User className="h-8 w-8 p-1 bg-primary text-primary-foreground rounded-full" />
                  ) : (
                    <Bot className="h-8 w-8 p-1 bg-secondary text-secondary-foreground rounded-full" />
                  )}
                </div>
                <div
                  className={`flex-1 p-3 rounded-lg ${
                    message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <Bot className="h-8 w-8 p-1 bg-secondary text-secondary-foreground rounded-full" />
              <div className="flex-1 p-3 rounded-lg bg-muted mr-12">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="اكتب رسالتك هنا... / Type your message here..."
              disabled={isLoading}
              className="flex-1"
              dir="auto"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
