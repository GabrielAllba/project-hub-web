"use client"

import { useParams } from "react-router-dom"
import { ProjectLayout } from "../components/project-detail/layout/project-detail-layout"
import { BacklogTab } from "../components/project-detail/backlog-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()

  if (!projectId) {
    return <div>Project ID not found</div>
  }

  return (
    <Tabs defaultValue="backlog" className="mt-2">
      <ProjectLayout
        title="Landing Page PT"
        tabs={
          <TabsList className="border rounded-md inline-flex space-x-2">
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="backlog">
          <BacklogTab projectId={projectId} />
        </TabsContent>
      </ProjectLayout>
    </Tabs>
  )
}
