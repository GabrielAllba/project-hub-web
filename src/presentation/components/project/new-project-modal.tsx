import { useState } from "react";
import { toast } from "sonner";



import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useCreateProject } from "@/shared/hooks/use-create-project";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export const NewProjectModal = ({
  open,
  onOpenChange,
  onCreated,
}: NewProjectModalProps) => {
  const [projectName, setProjectName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const {
    triggerCreateProject,
    triggerCreateProjectLoading,
  } = useCreateProject();

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error("Nama proyek tidak boleh kosong");
      return;
    }

    const response = await triggerCreateProject({
      name: projectName,
      description,
    });

    if (response.status=== "success") {
      toast.success("Berhasil membuat proyek", {
        description: response.message,
      });
      setProjectName("");
      setDescription("");
      onOpenChange(false);
      onCreated();
    } else {
      toast.error("Gagal membuat proyek", {
        description: response.message,
      });
    }
  };

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
          />
          <Input
            placeholder="Deskripsi"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={triggerCreateProjectLoading}
          >
            Batal
          </Button>
          <Button onClick={handleCreate} disabled={triggerCreateProjectLoading}>
            {triggerCreateProjectLoading ? "Membuat..." : "Buat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
