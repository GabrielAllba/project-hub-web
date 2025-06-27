import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useProjects } from "@/shared/contexts/project-context";
import { GreetingSection } from "../ui/greeting";
import { Input } from "../ui/input";

export const ArchivedProjectHeaderSection = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { searchArchivedProjects } = useProjects();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchArchivedProjects(searchTerm);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <GreetingSection />
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">Archived Projects</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search input with icon */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Archived Project"
                className="w-[200px] pl-9 rounded-sm border-gray-300"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

    </>
  );
};
