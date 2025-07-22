"use client"

import type { ReactNode } from "react"

export interface ArtifactConfig<T extends string, M = any> {
  kind: T
  description: string
  initialize: (params: { setMetadata: (metadata: M) => void }) => Promise<void>
  onStreamPart: (params: { streamPart: any; setArtifact: (updater: (draft: any) => any) => void }) => void
  content: (params: {
    metadata: M
    setMetadata: (updater: (metadata: M) => M) => void
    [key: string]: any
  }) => ReactNode
  actions: Array<{
    icon: ReactNode
    label?: string
    description: string
    onClick: (params: any) => void | Promise<void>
    isDisabled?: (params: any) => boolean
  }>
  toolbar: Array<{
    icon: ReactNode
    description: string
    onClick: (params: any) => void
  }>
}

export class Artifact<T extends string, M = any> {
  constructor(public config: ArtifactConfig<T, M>) {}
}
