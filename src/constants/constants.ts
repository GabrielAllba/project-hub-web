import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog";

export const DEFAULT_PAGE_SIZE = 8
export const DEFAULT_PAGE = 0

export const PRODUCT_BACKLOG_PRIORITY_OPTIONS: ProductBacklogPriority[] = ["LOW", "MEDIUM", "HIGH"];
export const PRODUCT_BACKLOG_STATUS_OPTIONS: ProductBacklogStatus[] = ["TODO", "INPROGRESS", "DONE"];

export const STATUS_PROGRESS_MAP = {
  TODO: { label: "To Do", percent: 0 },
  INPROGRESS: { label: "In Progress", percent: 50 },
  DONE: { label: "Done", percent: 100 },
}


export const NO_GOAL_ID = "no-goal"
