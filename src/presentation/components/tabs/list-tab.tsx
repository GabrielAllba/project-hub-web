import { useState } from "react"
import ListSection from "../section/list-section"
import ProductGoalsSection from "../section/product-goals-section"
import { Button } from "../ui/button"
import { Input } from "../ui/input"


interface ListTabProps {
  projectId: string
}

export const ListTab = ({ projectId }: ListTabProps) => {
  const [showProductGoals, setShowProductGoals] = useState(false)

  const toggleProductGoals = () => {
    setShowProductGoals((prev) => !prev)
  }

  return (
    <div className="flex gap-6">
      {showProductGoals && (
        <div className="w-[280px]">
          <ProductGoalsSection projectId={projectId} />
        </div>
      )}

      <div className="flex-1 space-y-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant={showProductGoals ? "default" : "outline"}
              onClick={toggleProductGoals}
              className="hover:cursor-pointer"
            >
              Product Goals
            </Button>
            <Button variant="outline">Prioritas</Button>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Cari Tugas" className="w-64" />
          </div>
        </div>

        <ListSection projectId={projectId} />
      </div>
    </div>
  )
}
