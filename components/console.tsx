"use client"

export interface ConsoleOutputContent {
  type: "text" | "image"
  value: string
}

export interface ConsoleOutput {
  id: string
  contents: ConsoleOutputContent[]
  status: "in_progress" | "loading_packages" | "completed" | "failed"
}

export function Console({
  consoleOutputs,
  setConsoleOutputs,
}: {
  consoleOutputs: ConsoleOutput[]
  setConsoleOutputs: () => void
}) {
  if (consoleOutputs.length === 0) return null

  return (
    <div className="border-t bg-muted/50">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-medium">Console Output</span>
        <button onClick={setConsoleOutputs} className="text-xs text-muted-foreground hover:text-foreground">
          Clear
        </button>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        {consoleOutputs.map((output) => (
          <div key={output.id} className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">Status: {output.status}</div>
            {output.contents.map((content, index) => (
              <div key={index} className="mb-2">
                {content.type === "image" ? (
                  <img src={content.value || "/placeholder.svg"} alt="Output" className="max-w-full h-auto" />
                ) : (
                  <pre className="text-sm bg-background p-2 rounded border overflow-x-auto">{content.value}</pre>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
