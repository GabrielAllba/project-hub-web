import type { ProjectSummary } from "@/domain/entities/project-summary";
import { Skeleton } from "../ui/skeleton";
import { ProjectCard } from "../card/project-card";

interface ProjectSectionProps {
  projects: ProjectSummary[];
  isLoading: boolean;
}

export const ProjectSection = ({ projects, isLoading }: ProjectSectionProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-xl shadow-sm space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return <div className="text-muted-foreground">Belum ada proyek.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.projectId} project={project} />
      ))}
    </div>
  );
};
