import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";

import type { User } from "@/domain/entities/user";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { NewProjectModal } from "./new-project-modal";
import { useGetMe } from "@/shared/hooks/use-get-me";

interface HeaderSectionProps {
  selectedRole?: string;
  onRoleChange: (val: string) => void;
  onCreatedProject: () => void;
}

export const HeaderSection = ({
  selectedRole,
  onRoleChange,
  onCreatedProject,
}: HeaderSectionProps) => {
  const [today, setToday] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { triggerGetMe, triggerGetMeResponse} = useGetMe();

  const user: User | undefined = triggerGetMeResponse?.data;

  useEffect(() => {
    const now = new Date();
    setToday(format(now, "EEEE, dd MMMM yyyy", { locale: id }));

    const hour = now.getHours();
    if (hour < 11) setGreeting("Selamat pagi");
    else if (hour < 15) setGreeting("Selamat siang");
    else if (hour < 18) setGreeting("Selamat sore");
    else setGreeting("Selamat malam");

    triggerGetMe();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{today}</p>

        <h1 className="text-3xl font-semibold">
          {greeting}, {user?.username ?? "Pengguna"}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">📁 Proyek</span>

            <Select value={selectedRole} onValueChange={onRoleChange}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Filter Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                <SelectItem value="DEVELOPER">Developer</SelectItem>
                <SelectItem value="PRODUCT_OWNER">Product Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Cari Proyek"
              className="w-[200px]"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button className="text-white" onClick={() => setOpenModal(true)}>
              + Proyek Baru
            </Button>
          </div>
        </div>
      </div>

      <NewProjectModal
        open={openModal}
        onOpenChange={setOpenModal}
        onCreated={onCreatedProject}
      />
    </>
  );
};
