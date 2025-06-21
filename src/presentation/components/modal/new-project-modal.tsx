import { useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { useProjects } from "@/shared/contexts/project-context"

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export const NewProjectModal = ({
  open,
  onOpenChange,
  onCreated,
}: NewProjectModalProps) => {
  const [projectName, setProjectName] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const { createProject } = useProjects()

  const handleCreate = async () => {
    if (!projectName.trim()) return

    setIsCreating(true)
    const created = await createProject(projectName.trim())
    setIsCreating(false)

    if (created) {
      setProjectName("")
      onOpenChange(false)
      onCreated()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCreate()
    if (e.key === "Escape") {
      setProjectName("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Proyek Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="Nama Proyek"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            maxLength={255}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setProjectName("")
              onOpenChange(false)
            }}
            disabled={isCreating}
          >
            Batal
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Membuat..." : "Buat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
