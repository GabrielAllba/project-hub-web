
"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/constants/constants"
import type { SprintResponseDTO } from "@/domain/dto/res/sprint-res"
import type { ProductBacklog, ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog"
import type { Sprint } from "@/domain/entities/sprint"

import type { CreateProductBacklogRequestDTO } from "@/domain/dto/req/create-product-backlog-req"
import type { CompleteSprintInfoResponseDTO } from "@/domain/dto/res/complete-sprint-info-res"
import { useCompleteSprint } from "@/shared/hooks/use-complete-sprint"
import { useGetCompleteSprintInfo } from "@/shared/hooks/use-get-complete-sprint-info"
import { useGetProductBacklogBySprint } from "@/shared/hooks/use-get-product-backlog-by-sprint"
import { useGetProjectSprints } from "@/shared/hooks/use-get-project-sprints"
import { useStartSprint } from "@/shared/hooks/use-start-sprint"
import { toast } from "sonner"
import { type BaseResponse } from '../../domain/dto/base-response'
import { type EditSprintGoalAndDatesRequestDTO } from '../../domain/dto/req/edit-sprint-goal-and-dates-req'
import { useAssignBacklogUser } from "../hooks/use-assign-backlog-user"
import { useCreateProductBacklog } from "../hooks/use-create-product-backlog"
import { useCreateSprint } from "../hooks/use-create-sprint"
import { useDeleteBacklog } from "../hooks/use-delete-backlog"
import { useEditBacklogGoal } from "../hooks/use-edit-backlog-goal"
import { useEditBacklogPoint } from "../hooks/use-edit-backlog-point"
import { useEditBacklogPriority } from "../hooks/use-edit-backlog-priority"
import { useEditBacklogStatus } from "../hooks/use-edit-backlog-status"
import { useEditBacklogTitle } from "../hooks/use-edit-backlog-title"
import { useEditSprintGoalAndDates } from "../hooks/use-edit-sprint-goal-and-dates"
import { useGetProjectSprintsInProgress } from "../hooks/use-get-project-sprints-in-progress"
import { useReorderProductBacklog } from "../hooks/use-reorder-product-backlog"


interface SprintContextType {
  sprints: Sprint[]
  sprintBacklogs: Record<string, ProductBacklog[]>
  sprintTotalItems: Record<string, number>
  sprintHasMore: Record<string, boolean>
  loadingSprints: boolean
  loadingSprintBacklogs: Record<string, boolean>
  hasMoreSprints: boolean
  search: string
  status?: ProductBacklogStatus
  priority?: ProductBacklogPriority
  productGoalIds?: string[]
  assigneeIds?: string[]

  sprintsInProgress: Sprint[]
  selectedSprintId: string
  selectedSprintBacklogs: ProductBacklog[]
  selectedSprintBacklogsHasMore: boolean
  isLoadMoreSelectedSprintBacklogsLoading: boolean

  setSearch: (search: string) => void
  setStatus: (status?: ProductBacklogStatus) => void
  setPriority: (priority?: ProductBacklogPriority) => void
  setProductGoalIds: (productGoalIds: string[]) => void
  setAssigneeIds: (assigneeIds: string[]) => void
  setSelectedSprintId: (sprintId: string) => void


  loadInitialSprints: () => Promise<void>
  loadMoreSprints: () => Promise<void>
  loadMoreSprintBacklogs: (sprintId: string) => Promise<void>
  deleteSprintBacklogItem: (sprintId: string, backlogId: string) => void
  removeSprintBacklogItem: (sprintId: string, backlogId: string) => void
  insertSprintBacklogItemAt: (sprintId: string, item: ProductBacklog, position: number) => Promise<void> // Mark as Promise<void>
  startSprint: (sprintId: string) => Promise<void>
  completeSprint: (sprintId: string) => Promise<BaseResponse<SprintResponseDTO | null>>
  getCompleteSprintInfo: (sprintId: string) => Promise<BaseResponse<CompleteSprintInfoResponseDTO>>
  editSprintGoalAndDates: (req: EditSprintGoalAndDatesRequestDTO) => Promise<BaseResponse<SprintResponseDTO>>
  loadMoreSelectedSprintBacklogs: () => Promise<void>


  createSprintBacklog: (dto: CreateProductBacklogRequestDTO) => Promise<BaseResponse<ProductBacklog>>
  editBacklogPoint: (backlogId: string, point: number) => Promise<void>
  editBacklogTitle: (backlogId: string, title: string) => Promise<void>
  editBacklogPriority: (backlogId: string, priority: ProductBacklogPriority) => Promise<void>
  editBacklogStatus: (backlogId: string, status: ProductBacklogStatus) => Promise<void>
  editBacklogGoal: (backlogId: string, goalId: string | null) => Promise<void>
  assignBacklogUser: (backlogId: string, assigneeId: string) => Promise<void>
  createSprint: () => Promise<void>
}

const SprintContext = createContext<SprintContextType | undefined>(undefined)

export const SprintProvider = ({ projectId, children }: { projectId: string; children: ReactNode }) => {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [sprintBacklogs, setSprintBacklogs] = useState<Record<string, ProductBacklog[]>>({})
  const [sprintTotalItems, setSprintTotalItems] = useState<Record<string, number>>({})
  const [sprintHasMore, setSprintHasMore] = useState<Record<string, boolean>>({})
  const [loadingSprints, setLoadingSprints] = useState(false)
  const [loadingSprintBacklogs, setLoadingSprintBacklogs] = useState<Record<string, boolean>>({})
  const [currentPageSprints, setCurrentPageSprints] = useState(DEFAULT_PAGE)
  const [hasMoreSprints, setHasMoreSprints] = useState(true)

  const [sprintsInProgress, setSprintsInProgress] = useState<Sprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<string>("")
  const [selectedSprintBacklogs, setSelectedSprintBacklogs] = useState<ProductBacklog[]>([])
  const [selectedSprintBacklogsHasMore, setSelectedSprintBacklogsHasMore] = useState<boolean>(false)
  const [isLoadMoreSelectedSprintBacklogsLoading, setIsLoadMoreSelectedSprintBacklogsLoading] = useState<boolean>(false)


  // Filter states
  const [search, setSearch] = useState<string>("")
  const [status, setStatus] = useState<ProductBacklogStatus | undefined>(undefined)
  const [priority, setPriority] = useState<ProductBacklogPriority | undefined>(undefined)
  const [productGoalIds, setProductGoalIds] = useState<string[]>([])
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])

  const { triggerCreateSprint } = useCreateSprint()
  const { triggerGetProjectSprints } = useGetProjectSprints(projectId)
  const { triggerGetProductBacklogBySprint } = useGetProductBacklogBySprint("")
  const { triggerStartSprint } = useStartSprint("")
  const { triggerCompleteSprint } = useCompleteSprint("")
  const { triggerGetCompleteSprintInfo } = useGetCompleteSprintInfo("")
  const { triggerEditSprintGoalAndDates } = useEditSprintGoalAndDates()
  const { triggerReorderProductBacklog } = useReorderProductBacklog()
  const { triggerDeleteBacklog } = useDeleteBacklog("");
  const { triggerEditBacklogPoint } = useEditBacklogPoint()
  const { triggerEditBacklogTitle } = useEditBacklogTitle()
  const { triggerEditBacklogPriority } = useEditBacklogPriority()
  const { triggerEditBacklogStatus } = useEditBacklogStatus()
  const { triggerEditBacklogGoal } = useEditBacklogGoal()
  const { triggerAssignBacklogUser } = useAssignBacklogUser()
  const { triggerCreateProductBacklog } = useCreateProductBacklog()
  const { triggerGetProjectSprintsInProgress } = useGetProjectSprintsInProgress(projectId)


  const createSprint = async () => {
    try {
      const res = await triggerCreateSprint({ projectId });

      if (res.status === "success" && res.data) {
        const newSprint: Sprint = {
          id: res.data.id,
          projectId: res.data.projectId,
          name: res.data.name,
          startDate: res.data.startDate,
          endDate: res.data.endDate,
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
          sprintGoal: res.data.sprintGoal,
          status: res.data.status,
        };

        setSprints((prev) => [newSprint, ...prev]);
        setSprintBacklogs((prev) => ({ ...prev, [newSprint.id]: [] }));
        setSprintTotalItems((prev) => ({ ...prev, [newSprint.id]: 0 }));
        setSprintHasMore((prev) => ({ ...prev, [newSprint.id]: false }));
        setLoadingSprintBacklogs((prev) => ({ ...prev, [newSprint.id]: false }));

      } else {
        toast.error(`Failed to create sprint: ${res.message || "Unknown error"}`);
      }
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err}`);
    }
  }

  const loadSprintsInProgress = async () => {
    try {
      const res = await triggerGetProjectSprintsInProgress(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
      if (res.status === "success" && res.data?.content) {
        setSprintsInProgress(res.data.content)
        if (res.data.content.length > 0) {
          setSelectedSprintId(res.data.content[0].id)
        } else {
          setSelectedSprintId("")
        }
      }
    } catch (err) {
      console.error("Failed to fetch in-progress sprints:", err)
    }
  }


  const loadInitialSprints = useCallback(async () => {
    setLoadingSprints(true)
    try {
      const res = await triggerGetProjectSprints(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
      if (res.status === "success" && res.data) {
        const newSprints: Sprint[] = res.data.content.map((dto: SprintResponseDTO) => ({
          id: dto.id,
          projectId: dto.projectId,
          name: dto.name,
          startDate: dto.startDate,
          endDate: dto.endDate,
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt,
          sprintGoal: dto.sprintGoal,
          status: dto.status,
        }))

        setSprints(newSprints)
        setCurrentPageSprints(DEFAULT_PAGE)
        setHasMoreSprints(!res.data.last)

        const backlogMap: Record<string, ProductBacklog[]> = {}
        const totalMap: Record<string, number> = {}
        const hasMoreMap: Record<string, boolean> = {}
        const loadingMap: Record<string, boolean> = {}

        for (const sprint of newSprints) {
          loadingMap[sprint.id] = true
          const backlogRes = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE,
            {
              search,
              status,
              priority,
              productGoalIds,
              assigneeIds,
            })
          if (backlogRes.status === "success") {
            backlogMap[sprint.id] = backlogRes.data.content
            totalMap[sprint.id] = backlogRes.data.totalElements
            hasMoreMap[sprint.id] = !backlogRes.data.last
          }
          loadingMap[sprint.id] = false
        }

        setSprintBacklogs(backlogMap)
        setSprintTotalItems(totalMap)
        setSprintHasMore(hasMoreMap)
        setLoadingSprintBacklogs(loadingMap)
      }
    } finally {
      setLoadingSprints(false)
    }
  }, [projectId, search, status, priority, assigneeIds, productGoalIds]) // Dependencies for filters

  const loadMoreSprints = useCallback(async () => {
    if (!hasMoreSprints) return
    const nowPage = Math.floor(sprints.length / DEFAULT_PAGE_SIZE)


    setLoadingSprints(true)
    try {
      const res = await triggerGetProjectSprints(nowPage, DEFAULT_PAGE_SIZE)
      if (res.status === "success" && res.data) {
        const newSprints: Sprint[] = res.data.content.map((dto: SprintResponseDTO) => ({
          id: dto.id,
          projectId: dto.projectId,
          name: dto.name,
          startDate: dto.startDate,
          endDate: dto.endDate,
          createdAt: dto.createdAt,
          updatedAt: dto.updatedAt,
          sprintGoal: dto.sprintGoal,
          status: dto.status,
        }))

        setSprints((prev) => [...prev, ...newSprints])
        setCurrentPageSprints(nowPage)
        setHasMoreSprints(!res.data.last)

        for (const sprint of newSprints) {
          setLoadingSprintBacklogs((prev) => ({ ...prev, [sprint.id]: true }))
          const backlogRes = await triggerGetProductBacklogBySprint(sprint.id, DEFAULT_PAGE, DEFAULT_PAGE_SIZE,
            {
              search,
              status,
              priority,
              productGoalIds,
              assigneeIds,

            })
          if (backlogRes.status === "success") {
            setSprintBacklogs((prev) => ({
              ...prev,
              [sprint.id]: backlogRes.data.content,
            }))
            setSprintTotalItems((prev) => ({
              ...prev,
              [sprint.id]: backlogRes.data.totalElements,
            }))
            setSprintHasMore((prev) => ({
              ...prev,
              [sprint.id]: !backlogRes.data.last,
            }))
          }
          setLoadingSprintBacklogs((prev) => ({ ...prev, [sprint.id]: false }))
        }
      }
    } finally {
      setLoadingSprints(false)
    }
  }, [currentPageSprints, hasMoreSprints, search, status, priority, assigneeIds, productGoalIds]) // Dependencies for filters

  const loadMoreSprintBacklogs = async (sprintId: string) => {
    const currentItemsInStateSnapshot = sprintBacklogs[sprintId] || [];
    const page = Math.floor(currentItemsInStateSnapshot.length / DEFAULT_PAGE_SIZE);

    setLoadingSprintBacklogs((prev) => ({ ...prev, [sprintId]: true }));

    try {
      const res = await triggerGetProductBacklogBySprint(sprintId, page, DEFAULT_PAGE_SIZE,
        {
          search,
          status,
          priority,
          productGoalIds,
          assigneeIds,
        });
      if (res.status === "success" && res.data) {
        setSprintBacklogs((prevSprintBacklogs) => {
          const existingItems = prevSprintBacklogs[sprintId] || [];
          const uniqueNewItems = res.data.content.filter(
            (item) => !existingItems.some((existing) => existing.id === item.id)
          );

          return {
            ...prevSprintBacklogs,
            [sprintId]: [...existingItems, ...uniqueNewItems],
          };
        });

        setSprintTotalItems((prev) => ({
          ...prev,
          [sprintId]: res.data.totalElements,
        }));
        setSprintHasMore((prev) => ({
          ...prev,
          [sprintId]: !res.data.last,
        }));
      } else {
        toast.error(`Failed to load more backlog items: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    } finally {
      setLoadingSprintBacklogs((prev) => ({ ...prev, [sprintId]: false }));
    }
  }


  const deleteSprintBacklogItem = async (sprintId: string, backlogId: string) => {
    try {
      const res = await triggerDeleteBacklog(backlogId);
      if (res.status === "success") {
        setSprintBacklogs((prev) => ({
          ...prev,
          [sprintId]: (prev[sprintId] || []).filter((b) => b.id !== backlogId),
        }));
        setSprintTotalItems((prev) => ({
          ...prev,
          [sprintId]: Math.max(0, (prev[sprintId] || 0) - 1),
        }));
        toast.success("Backlog deleted successfully!");
      } else {
        toast.error(`Failed to delete backlog: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    }
  };

  const removeSprintBacklogItem = useCallback((sprintId: string, backlogId: string) => {
    setSprintBacklogs((prev) => {
      const updatedList = (prev[sprintId] || []).filter((item) => item.id !== backlogId);
      return {
        ...prev,
        [sprintId]: updatedList,
      };
    });
    setSprintTotalItems((prev) => ({
      ...prev,
      [sprintId]: (prev[sprintId] || 0) - 1,
    }));
  }, []);

  const insertSprintBacklogItemAt = useCallback(
    async (sprintId: string, item: ProductBacklog, position: number) => {
      setSprintBacklogs((prev) => {
        const newSprintBacklogs = { ...prev };
        const currentSprintItems = newSprintBacklogs[sprintId] || [];
        const updatedSprintItems = [...currentSprintItems];
        const insertPos = Math.max(0, Math.min(position, updatedSprintItems.length));
        updatedSprintItems.splice(insertPos, 0, item);
        newSprintBacklogs[sprintId] = updatedSprintItems;
        return newSprintBacklogs;
      });
      setSprintTotalItems((prev) => ({
        ...prev,
        [sprintId]: (prev[sprintId] || 0) + 1,
      }));

      try {
        await triggerReorderProductBacklog({
          activeId: item.id,
          originalContainer: item.sprintId ?? null,
          currentContainer: sprintId,
          insertPosition: position,
        });
      } catch (error) {
        toast.error(`Failed to reorder backlog: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
    [triggerReorderProductBacklog] // Added triggerReorderProductBacklog to dependencies
  );

  const startSprint = async (sprintId: string) => {
    try {
      const res = await triggerStartSprint(sprintId);
      if (res.status === "success" && res.data) {
        setSprints((prev) =>
          prev.map((sprint) => (sprint.id === sprintId ? { ...sprint, status: res.data!.status } : sprint))
        );

        setSprints((prev) =>
          prev.map((sprint) =>
            sprint.id === sprintId
              ? { ...sprint, sprintGoal: res.data!.sprintGoal, startDate: res.data!.startDate, endDate: res.data!.endDate }
              : sprint
          )
        );

      } else {
        toast.error(`Failed to start sprint: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      const baseError = error as BaseResponse<null>
      toast.error(`An unexpected error occurred: ${baseError.message}`);
    }
  };

  const completeSprint = async (sprintId: string): Promise<BaseResponse<SprintResponseDTO | null>> => {
    try {
      const res = await triggerCompleteSprint(sprintId)

      if (res.status === "success" && res.data) {
        setSprints((prev) =>
          prev.map((sprint) =>
            sprint.id === sprintId ? { ...sprint, status: res.data!.status } : sprint
          )
        )
        toast.success("Sprint completed successfully!")
      } else {
        toast.error(`Failed to complete sprint: ${res.message || "Unknown error"}`)
      }

      return res
    } catch (error) {
      const baseError = error as BaseResponse<null>
      toast.error(`${baseError.message}`)
      return { status: "error", message: baseError.message || "Unexpected error" } as BaseResponse<null>;
    }
  }

  const getCompleteSprintInfo = async (sprintId: string) => {
    try {
      const res = await triggerGetCompleteSprintInfo(sprintId);
      if (res.status === "success") {
        return res
      } else {
        toast.error(`Failed to fetch complete sprint info: ${res.message || "Unknown error"}`);
        return { status: "error", message: res.message || "Unknown error" } as BaseResponse<CompleteSprintInfoResponseDTO>;
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
      return { status: "error", message: error || "Unexpected error" } as BaseResponse<CompleteSprintInfoResponseDTO>;
    }
  };

  const editSprintGoalAndDates = async (req: EditSprintGoalAndDatesRequestDTO) => {
    try {
      const res = await triggerEditSprintGoalAndDates(req);
      if (res.status === "success" && res.data) {
        setSprints((prev) =>
          prev.map((sprint) =>
            sprint.id === req.sprintId
              ? { ...sprint, sprintGoal: res.data!.sprintGoal, startDate: res.data!.startDate, endDate: res.data!.endDate }
              : sprint
          )
        );
        toast.success("Sprint updated successfully!");
        return res;
      } else {
        toast.error(`Failed to update sprint: ${res.message || "Unknown error"}`);
        return { status: "error", message: res.message || "Unknown error" } as BaseResponse<SprintResponseDTO>;
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
      return { status: "error", message: error || "Unexpected error" } as BaseResponse<SprintResponseDTO>;
    }
  };


  const editBacklogPoint = async (backlogId: string, point: number) => {
    try {
      const res = await triggerEditBacklogPoint({ backlogId, point });
      if (res.status === "success" && res.data) {
        loadInitialSprints();
        setSelectedSprintBacklogs((prev) =>
          prev.map((backlog) =>
            backlog.id === backlogId ? { ...backlog, point: res.data.point } : backlog
          )
        )
        toast.success("Backlog point updated!");
      } else {
        toast.error(`Failed to update backlog point: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    }
  };

  const editBacklogTitle = async (backlogId: string, title: string) => {
    try {
      const res = await triggerEditBacklogTitle({ backlogId, title });
      if (res.status === "success" && res.data) {
        loadInitialSprints();

        setSelectedSprintBacklogs((prev) =>
          prev.map((backlog) =>
            backlog.id === backlogId ? { ...backlog, title: res.data.title } : backlog
          )
        )
        toast.success("Backlog title updated!");
      } else {
        toast.error(`Failed to update backlog title: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    }
  };

  const editBacklogPriority = async (
    backlogId: string,
    priority: ProductBacklogPriority
  ) => {
    try {
      const res = await triggerEditBacklogPriority({ backlogId, priority });
      if (res.status === "success") {
        loadInitialSprints();

        setSelectedSprintBacklogs((prev) =>
          prev.map((backlog) =>
            backlog.id === backlogId ? { ...backlog, priority: res.data.priority } : backlog
          )
        )
        toast.success("Backlog priority updated successfully!");
      } else {
        toast.error(`Failed to update backlog priority: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    }
  };


  const editBacklogStatus = async (backlogId: string, status: ProductBacklogStatus) => {
    try {
      const res = await triggerEditBacklogStatus({ backlogId, status });
      if (res.status === "success" && res.data) {
        loadInitialSprints();

        setSelectedSprintBacklogs((prev) =>
          prev.map((backlog) =>
            backlog.id === backlogId ? { ...backlog, status: res.data.status } : backlog
          )
        )
        toast.success("Backlog status updated!");
      } else {
        toast.error(`Failed to update backlog status: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    }
  };

  const editBacklogGoal = async (backlogId: string, goalId: string | null) => {
    try {
      const res = await triggerEditBacklogGoal({ backlogId, goalId });
      if (res.status === "success" && res.data) {
        loadInitialSprints();
        setSelectedSprintBacklogs((prev) =>
          prev.map((backlog) =>
            backlog.id === backlogId ? { ...backlog, productGoalId: res.data.productGoalId } : backlog
          )
        )
        toast.success("Backlog goal updated!");
      } else {
        toast.error(`Failed to update backlog goal: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    }
  };

  const assignBacklogUser = async (backlogId: string, assigneeId: string) => {
    try {
      const res = await triggerAssignBacklogUser({ backlogId, assigneeId });
      if (res.status === "success" && res.data) {
        loadInitialSprints();
        setSelectedSprintBacklogs((prev) =>
          prev.map((backlog) =>
            backlog.id === backlogId ? { ...backlog, assigneeId: res.data.assigneeId } : backlog
          )
        )
        toast.success("Backlog user assigned!");
      } else {
        toast.error(`Failed to assign backlog user: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    }
  };

  const createSprintBacklog = async (dto: CreateProductBacklogRequestDTO) => {
    try {
      const res = await triggerCreateProductBacklog(dto, projectId);
      if (res.status === "success" && res.data && dto.sprintId) {
        insertSprintBacklogItemAt(dto.sprintId, res.data, 0); // Insert at the beginning
        toast.success("Backlog created successfully!");
      } else {
        toast.error(`Failed to create backlog: ${res.message || "Unknown error"}`);
      }
      return res;
    } catch (error) {
      toast.error(`An unexpected error occurred while creating backlog: ${error} `);
      return { status: "error", message: error || "Unexpected error" } as BaseResponse<ProductBacklog>;
    }
  };

  const loadMoreSelectedSprintBacklogs = async () => {
    if (!selectedSprintId || !selectedSprintBacklogsHasMore || isLoadMoreSelectedSprintBacklogsLoading) return;

    setIsLoadMoreSelectedSprintBacklogsLoading(true);

    const page = Math.floor(selectedSprintBacklogs.length / DEFAULT_PAGE_SIZE);

    try {
      const res = await triggerGetProductBacklogBySprint(
        selectedSprintId,
        page,
        DEFAULT_PAGE_SIZE,
        {
          search,
          status,
          priority,
          productGoalIds,
          assigneeIds,
        }
      );

      if (res.status === "success" && res.data) {
        const newItems = res.data.content.filter(
          (item) => !selectedSprintBacklogs.some((existing) => existing.id === item.id)
        );

        setSelectedSprintBacklogs((prev) => [...prev, ...newItems]);
        setSelectedSprintBacklogsHasMore(!res.data.last);
      } else {
        toast.error(`Failed to load more backlog items: ${res.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error}`);
    } finally {
      setIsLoadMoreSelectedSprintBacklogsLoading(false);
    }
  };


  useEffect(() => {
    loadInitialSprints()
  }, [projectId, search, status, priority, productGoalIds, assigneeIds])

  useEffect(() => {
    loadSprintsInProgress()
  }, [projectId])

  useEffect(() => {
    const load = async () => {
      const backlogRes = await triggerGetProductBacklogBySprint(selectedSprintId, DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
      if (backlogRes.status == "success") {
        setSelectedSprintBacklogs(backlogRes.data.content)

        if (!backlogRes.data.last) {
          setSelectedSprintBacklogsHasMore(true)
        }
      }
    }
    load()

  }, [selectedSprintId])


  return (
    <SprintContext.Provider
      value={{
        sprints,
        sprintBacklogs,
        sprintTotalItems,
        sprintHasMore,
        loadingSprints,
        loadingSprintBacklogs,
        hasMoreSprints,
        search,
        status,
        priority,
        productGoalIds,
        assigneeIds,

        sprintsInProgress,
        selectedSprintId,
        selectedSprintBacklogs,
        selectedSprintBacklogsHasMore,
        isLoadMoreSelectedSprintBacklogsLoading,

        setSearch,
        setStatus,
        setPriority,
        setAssigneeIds,
        setProductGoalIds,
        setSelectedSprintId,

        loadInitialSprints,
        loadMoreSprints,
        loadMoreSprintBacklogs,
        loadMoreSelectedSprintBacklogs,

        deleteSprintBacklogItem,
        removeSprintBacklogItem,
        insertSprintBacklogItemAt,
        startSprint,
        completeSprint,
        getCompleteSprintInfo,
        createSprintBacklog,
        editSprintGoalAndDates,
        editBacklogPoint,
        editBacklogTitle,
        editBacklogPriority,
        editBacklogStatus,
        editBacklogGoal,
        assignBacklogUser,
        createSprint
      }}
    >
      {children}
    </SprintContext.Provider>
  )
}


export const useSprint = () => {
  const context = useContext(SprintContext)
  if (context === undefined) {
    throw new Error("useSprint must be used within a SprintProvider")
  }
  return context
}