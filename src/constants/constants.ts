import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog";

export const DEFAULT_PAGE_SIZE = 8
export const DEFAULT_PAGE = 0

export const PRODUCT_BACKLOG_PRIORITY_OPTIONS: ProductBacklogPriority[] = ["LOW", "MEDIUM", "HIGH"];
export const PRODUCT_BACKLOG_STATUS_OPTIONS: ProductBacklogStatus[] = ["TODO", "INPROGRESS", "DONE"];
