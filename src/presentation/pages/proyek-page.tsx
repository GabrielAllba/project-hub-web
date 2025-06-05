import type { ProjectSummary } from '@/domain/entities/project-summary';
import { useGetMyProject } from '@/shared/hooks/use-get-my-project';
import { useEffect, useState } from 'react';
import { ProjectHeaderSection } from '../components/section/project-header-section';
import { ProjectSection } from '../components/section/project-section';
import { PaginationSection } from '../components/ui/pagination-section';



export const ProyekPage = () => {
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedRole, setSelectedRole] = useState<string | undefined>();

  const {
    triggerGetMyProject,
    triggerGetMyProjectResponse,
    triggerGetMyProjectLoading,
  } = useGetMyProject();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    triggerGetMyProject(page, itemsPerPage)
  }, [page, itemsPerPage]);


  useEffect(() => {
    if (triggerGetMyProjectResponse) {
      setProjects(triggerGetMyProjectResponse.data.content || []);
      setTotalPages(triggerGetMyProjectResponse.data.totalPages ?? 1);
      setTotalItems(triggerGetMyProjectResponse.data.totalElements ?? 0);
      setErrorMessage(null);
    }
  }, [triggerGetMyProjectResponse]);



  const startItem = page * itemsPerPage + 1;
  const endItem = Math.min((page + 1) * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      <ProjectHeaderSection
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onCreatedProject={() => {
          triggerGetMyProject(page, itemsPerPage);
        }}
      />

      {errorMessage && (
        <div className="text-red-600 text-center">{errorMessage}</div>
      )}

      <ProjectSection projects={projects} isLoading={triggerGetMyProjectLoading} />

      <PaginationSection
        page={page}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        setPage={setPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
};
