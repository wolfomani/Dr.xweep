"use client"

import { Button } from "@/components/ui/button"

export type VisibilityType = "private" | "public"

export function VisibilitySelector({
  chatId,
  selectedVisibilityType,
  className,
}: {
  chatId: string
  selectedVisibilityType: VisibilityType
  className?: string
}) {
  return (
    <Button variant="outline" className={className}>
      {selectedVisibilityType === "private" ? "Private" : "Public"}
    </Button>
  )
}
