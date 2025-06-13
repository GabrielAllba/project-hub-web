"use client"

import {
  Globe,
  Layout,
  List as ListIcon,
  PanelTop
} from "lucide-react"
import { useParams } from "react-router-dom"
import { BoardTab } from "../components/tabs/board-tab"
import { ListTab } from "../components/tabs/list-tab"
import TimelineTab from "../components/tabs/timeline-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ProjectLayout } from "../layouts/project-detail-layout"

const tabConfig = [
  { value: "summary", label: "Summary", icon: Globe },
  { value: "list", label: "Backlog", icon: ListIcon },
  { value: "board", label: "Board", icon: Layout },
  { value: "timeline", label: "Timeline", icon: PanelTop },
]

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()

  if (!projectId) return <div>Project ID not found</div>

  const tabClass =
    "hover:cursor-pointer data-[state=active]:shadow-none rounded-none shadow-none group px-2 py-1 text-sm text-muted-foreground data-[state=active]:text-blue-600 data-[state=active]:border-b-2 border-0 data-[state=active]:border-blue-600 data-[state=active]:font-medium"

  return (
    <Tabs defaultValue="list" className="mt-2">
      <ProjectLayout
        title="Landing Page PT"
        tabs={
          <TabsList className="flex border-b bg-transparent w-full p-0 ">
            {tabConfig.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className={tabClass}>
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span> {/* Optional label hide on small screens */}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

        }
      >
        <TabsContent value="list">
          <ListTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="board">
          <BoardTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="timeline">
          <div className="grid grid-cols-1">
            <TimelineTab projectId={projectId} />
          </div>
        </TabsContent>
      </ProjectLayout>
    </Tabs>
  )
}
