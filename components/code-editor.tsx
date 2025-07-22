"use client"

import { useState } from "react"

export function CodeEditor({ content, onChange, ...props }: { content: string; onChange?: (value: string) => void }) {
  const [value, setValue] = useState(content || "")

  const handleChange = (newValue: string) => {
    setValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="border rounded-md">
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full h-64 p-4 font-mono text-sm bg-background text-foreground border-0 resize-none focus:outline-none"
        placeholder="Enter your Python code here..."
        {...props}
      />
    </div>
  )
}
