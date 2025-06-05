import { useState } from "react";


import { Button } from "../ui/button";
import { GreetingSection } from "../ui/greeting";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { NewProjectModal } from "../modal/new-project-modal";

interface ProjectHeaderSectionProps {
  selectedRole?: string;
  onRoleChange: (val: string) => void;
  onCreatedProject: () => void;
}

export const ProjectHeaderSection = ({
  selectedRole,
  onRoleChange,
  onCreatedProject,
}: ProjectHeaderSectionProps) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <GreetingSection></GreetingSection>
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
