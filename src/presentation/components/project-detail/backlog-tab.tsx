import { Button } from "../ui/button"
import { Input } from "../ui/input"
import ProductBacklogSection from "./product-backlog/product-backlog-section"

interface BacklogTabProps {
  projectId: string
}

export const BacklogTab = ({ projectId }: BacklogTabProps) => {
  console.log(projectId)
  return (
    <div className="flex gap-6">
      {/* <BacklogSidebar /> */}

      <div className="flex-1 space-y-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-2">
            <Button className="bg-primary text-white">+ Tugas Baru</Button>
            <Button variant="outline">Group Tugas</Button>
            <Button variant="outline">Prioritas</Button>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Cari Tugas" className="w-64" />
            <Button className="bg-primary text-white">Selesaikan Sprint</Button>
          </div>
        </div>

        <ProductBacklogSection projectId={projectId}/>
      </div>
    </div>
  )
}
