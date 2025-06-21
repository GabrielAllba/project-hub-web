"use client"

import { IconAlertCircle, IconHourglassEmpty, IconReport, IconUsersGroup } from "@tabler/icons-react"
import { Globe, Layout, List as ListIcon, PanelTop } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { BoardTab } from "../components/tabs/board-tab"
import { ListTab } from "../components/tabs/list-tab"
import { ReportTab } from "../components/tabs/report-tab"
import { SummaryTab } from "../components/tabs/summary-tab"
import { TeamTab } from "../components/tabs/team-tab"
import TimelineTab from "../components/tabs/timeline-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ProjectLayout } from "../layouts/project-detail-layout"

import type { BaseResponse } from "@/domain/dto/base-response"
import type { ProjectSummary } from "@/domain/entities/project-summary"
import { useGetProjectById } from "@/shared/hooks/use-get-project-by-id"

const tabConfig = [
  { value: "summary", label: "Summary", icon: Globe },
  { value: "list", label: "Backlog", icon: ListIcon },
  { value: "board", label: "Board", icon: Layout },
  { value: "timeline", label: "Timeline", icon: PanelTop },
  { value: "report", label: "Report", icon: IconReport },
  { value: "team", label: "Team", icon: IconUsersGroup },
]

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { triggerGetProjectById } = useGetProjectById(projectId || "")

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return

      try {
        const res = await triggerGetProjectById(projectId)
        if (res.status === "success") {
          setProject(res.data)
          setError(null)
        } else {
          setError("Failed to load project information.")
        }
      } catch (err) {
        const baseError = err as BaseResponse<null>
        setError(baseError?.message || "Something went wrong while fetching the project.")
      }
    }

    fetchProject()
  }, [projectId])

  if (!projectId) return <div>Project ID not found</div>

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-blue-800">
        <IconAlertCircle className="w-16 h-16 text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold">Failed to load project</h2>
        <p className="text-sm text-blue-600 mt-2">{error}</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-blue-800">
        <IconHourglassEmpty className="w-16 h-16 text-blue-500 animate-pulse mb-4" />
        <h2 className="text-xl font-semibold">Loading project info...</h2>
        <p className="text-sm text-blue-600 mt-2">Please wait while we fetch the project details.</p>
      </div>
    )
  }

  const tabClass =
    "hover:cursor-pointer data-[state=active]:shadow-none rounded-none shadow-none group px-2 py-1 text-sm text-muted-foreground data-[state=active]:text-blue-600 data-[state=active]:border-b-2 border-0 data-[state=active]:border-blue-600 data-[state=active]:font-medium"

  return (
    <Tabs defaultValue="list" className="mt-2">
      <ProjectLayout
        title={project.name}
        tabs={
          <TabsList className="flex border-b bg-transparent w-full p-0">
            {tabConfig.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className={tabClass}>
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        }
      >
        <TabsContent value="summary">
          <SummaryTab
            key={"summary-tab-project-" + projectId}
            projectId={projectId}
          />
        </TabsContent>
        <TabsContent value="list">
          <ListTab
            key={"list-tab-project-" + projectId}
            projectId={projectId}
          />
        </TabsContent>
        <TabsContent value="board">
          <BoardTab
            key={"board-tab-project-" + projectId}
            projectId={projectId}
          />
        </TabsContent>
        <TabsContent value="timeline">
          <div className="grid grid-cols-1">
            <TimelineTab
              key={"timeline-tab-project-" + projectId}
              projectId={projectId}
            />
          </div>
        </TabsContent>
        <TabsContent value="report">
          <ReportTab
            key={"report-tab-project-" + projectId}
            projectId={projectId}
          />
        </TabsContent>
        <TabsContent value="team">
          <TeamTab
            key={"team-tab-project-" + projectId}
            projectId={projectId}
          />
        </TabsContent>
      </ProjectLayout>
    </Tabs>
  )
}
