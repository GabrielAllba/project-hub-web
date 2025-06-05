import { Button } from "../ui/button"
import { Input } from "../ui/input"
import ListSection from "../section/list-section"

interface ListTabProps {
  projectId: string
}

export const ListTab = ({ projectId }: ListTabProps) => {
  console.log(projectId)
  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-2">
            <Button className="bg-primary text-white">+ Tugas Baru</Button>
            <Button variant="outline">Group Tugas</Button>
            <Button variant="outline">Prioritas</Button>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Cari Tugas" className="w-64" />
          </div>
        </div>

        <ListSection projectId={projectId}/>
      </div>
    </div>
  )
}
