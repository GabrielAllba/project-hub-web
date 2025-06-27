"use client"

import { BacklogProvider } from "@/shared/contexts/backlog-context"
import { DragStateProvider } from "@/shared/contexts/drag-state-context"
import { ProductGoalsProvider } from "@/shared/contexts/product-goals-context"
import { SprintProvider } from "@/shared/contexts/sprint-context"
import { ListTabContent } from "./content/list-tab-content"

interface ListTabProps {
  projectId: string
}

export const ListTab = ({ projectId }: ListTabProps) => {
  return (

    <ProductGoalsProvider projectId={projectId}>
      <BacklogProvider projectId={projectId}>
        <SprintProvider projectId={projectId}>
          <DragStateProvider>
            <ListTabContent />
          </DragStateProvider>
        </SprintProvider>
      </BacklogProvider>
    </ProductGoalsProvider>

  )
}

