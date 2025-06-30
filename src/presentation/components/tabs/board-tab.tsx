"use client"

import { BacklogProvider } from "@/shared/contexts/backlog-context"
import { DragStateProvider } from "@/shared/contexts/drag-state-context"
import { ProductGoalsProvider } from "@/shared/contexts/product-goals-context"
import { SprintProvider } from "@/shared/contexts/sprint-context"
import { BoardTabContent } from "./content/board-tab-content"

interface BoardTabProps {
  projectId: string
}

export const BoardTab = ({ projectId }: BoardTabProps) => {
  return (

    <ProductGoalsProvider projectId={projectId}>
      <BacklogProvider projectId={projectId}>
        <SprintProvider projectId={projectId}>
          <DragStateProvider>
            <BoardTabContent projectId={projectId} />
          </DragStateProvider>
        </SprintProvider>
      </BacklogProvider>
    </ProductGoalsProvider>

  )
}


