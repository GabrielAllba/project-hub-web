import type { TeamSummary } from '@/domain/entities/team-summary';
import { useGetMyTeams } from '@/shared/hooks/use-get-my-teams';
import { useEffect, useState } from 'react';
import { NewTeamModal } from '../components/teams/new-teams-modal';
import { TeamList } from '../components/teams/team-list';
import { Button } from '../components/ui/button';
import { GreetingSection } from '../components/ui/greeting';
import { Input } from '../components/ui/input';
import { PaginationSection } from '../components/ui/pagination-section';



export const TeamPage = () => {
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const startItem = page * itemsPerPage + 1;
  const endItem = Math.min((page + 1) * itemsPerPage, totalItems);

  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const {
    triggerGetMyTeams,
    triggerGetMyTeamsResponse,
    triggerGetMyTeamsLoading,
  } = useGetMyTeams();

  useEffect(() => {
    triggerGetMyTeams(page, itemsPerPage)
  }, [page, itemsPerPage]);


  useEffect(() => {
    if (triggerGetMyTeamsResponse) {
      setTeams(triggerGetMyTeamsResponse.data.content || []);
      setTotalPages(triggerGetMyTeamsResponse.data.totalPages ?? 1);
      setTotalItems(triggerGetMyTeamsResponse.data.totalElements ?? 0);
      setErrorMessage(null);
    }
  }, [triggerGetMyTeamsResponse]);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <GreetingSection></GreetingSection>

        <div className="flex items-center justify-end mt-4 gap-2 w-full sm:w-auto">
          <Input
            placeholder="Cari Tim"
            className="w-[200px]"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button className="text-white" onClick={() => setOpenModal(true)}>
            + Tim Baru
          </Button>
        </div>

        {errorMessage && (
          <div className="text-red-600 text-center">{errorMessage}</div>
        )}

        <TeamList teams={teams} isLoading={triggerGetMyTeamsLoading} />

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

        <NewTeamModal
          open={openModal}
          onOpenChange={setOpenModal}
          onCreated={() => { 
            triggerGetMyTeams(page, itemsPerPage)
          }}
        />
      </div>
    </div>
  );
};
