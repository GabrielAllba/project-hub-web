"use client"

import { useParams } from "react-router-dom"
import { ProjectLayout } from "../components/project-detail/layout/project-detail-layout"
import { ListTab } from "../components/project-detail/list-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()

  if (!projectId) {
    return <div>Project ID not found</div>
  }

  return (
    <Tabs defaultValue="list" className="mt-2">
      <ProjectLayout
        title="Landing Page PT"
        tabs={
          <TabsList className="border rounded-md inline-flex space-x-2">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="list">
          <ListTab projectId={projectId} />
        </TabsContent>
      </ProjectLayout>
    </Tabs>
  )
}
