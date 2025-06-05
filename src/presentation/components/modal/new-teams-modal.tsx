import { useCreateTeam } from "@/shared/hooks/use-create-team";
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

interface NewTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export const NewTeamModal = ({
  open,
  onOpenChange,
  onCreated,
}: NewTeamModalProps) => {
  const [teamName, setTeamName] = useState<string>("");

  const {
    triggerCreateTeam,
    triggerCreateTeamLoading,
  } = useCreateTeam();

  const handleCreate = async () => {
    if (!teamName.trim()) {
      toast.error("Nama tim tidak boleh kosong");
      return;
    }

    const response = await triggerCreateTeam({
      name: teamName,
    });

    if (response.status=== "success") {
      toast.success("Berhasil membuat tim", {
        description: response.message,
      });
      setTeamName("");
      onOpenChange(false);
      onCreated();
    } else {
      toast.error("Gagal membuat tim", {
        description: response.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Tim Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="Nama Tim"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            maxLength={255}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={triggerCreateTeamLoading}
          >
            Batal
          </Button>
          <Button onClick={handleCreate} disabled={triggerCreateTeamLoading}>
            {triggerCreateTeamLoading ? "Membuat..." : "Buat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
