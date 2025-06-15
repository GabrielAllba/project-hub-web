"use client"

import { DeveloperSection } from "../section/developer-section"
import { ProductOwnerSection } from "../section/product-owner-section"
import { ScrumMasterSection } from "../section/scrum-master-section"



export const TeamTab = ({ projectId }: { projectId: string }) => {
  return (
    <div className="p-4 space-y-6">
      <ProductOwnerSection projectId={projectId} />
      <ScrumMasterSection projectId={projectId} />
      <DeveloperSection projectId={projectId} />
    </div>
  )
}
