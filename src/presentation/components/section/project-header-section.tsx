import { useState } from "react";
import { Search } from "lucide-react";

import { NewProjectModal } from "../modal/new-project-modal";
import { Button } from "../ui/button";
import { GreetingSection } from "../ui/greeting";
import { Input } from "../ui/input";

export const ProjectHeaderSection = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <GreetingSection />
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">📁 Project</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search input with icon */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Project"
                className="w-[200px] pl-9 rounded-sm border-gray-300"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Button className="text-white" onClick={() => setOpenModal(true)}>
              + New Project
            </Button>
          </div>
        </div>
      </div>
      <NewProjectModal
        open={openModal}
        onOpenChange={setOpenModal}
        onCreated={() => { }}
      />
    </>
  );
};
