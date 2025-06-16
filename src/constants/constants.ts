import type { ProductBacklog, ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog";
import type { Sprint } from "@/domain/entities/sprint";
import type { User } from "@/domain/entities/user";

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

export type ProjectRole = "SCRUM_MASTER" | "DEVELOPER" | "PRODUCT_OWNER"



export const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export const getMockSprints = (projectId: string): Sprint[] => [
  {
    id: "1",
    projectId: projectId,
    name: "Sprint 23",
    sprintGoal: "Implement user authentication and authorization system",
    startDate: "2024-01-15",
    endDate: "2024-01-29",
    status: "COMPLETED",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-29T00:00:00Z",
  },
  {
    id: "2",
    projectId: projectId,
    name: "Sprint 24",
    sprintGoal: "Create responsive dashboard interface",
    startDate: "2024-01-30",
    endDate: "2024-02-13",
    status: "COMPLETED",
    createdAt: "2024-01-25T00:00:00Z",
    updatedAt: "2024-02-13T00:00:00Z",
  },
  {
    id: "3",
    projectId: projectId,
    name: "Sprint 25",
    sprintGoal: "Integrate third-party APIs and data sources",
    startDate: "2024-02-14",
    endDate: "2024-02-28",
    status: "IN_PROGRESS",
    createdAt: "2024-02-10T00:00:00Z",
    updatedAt: "2024-02-20T00:00:00Z",
  },
]

export const getMockUsers = (): User[] => [
  { id: "user1", username: "John Doe", email: "john@example.com" },
  { id: "user2", username: "Jane Smith", email: "jane@example.com" },
  { id: "user3", username: "Mike Johnson", email: "mike@example.com" },
  { id: "user4", username: "Sarah Wilson", email: "sarah@example.com" },
]

export const getMockBacklogItems = (projectId: string, sprintId: string): ProductBacklog[] => [
  {
    id: "1",
    projectId: projectId,
    point: 8,
    sprintId: sprintId,
    productGoalId: "goal1",
    title: "Implement user login with email and password",
    priority: "HIGH",
    status: "DONE",
    creatorId: "user1",
    assigneeId: "user2",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "2",
    projectId: projectId,
    point: 5,
    sprintId: sprintId,
    productGoalId: "goal1",
    title: "Create password reset functionality",
    priority: "HIGH",
    status: "DONE",
    creatorId: "user1",
    assigneeId: "user3",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z",
  },
  {
    id: "3",
    projectId: projectId,
    point: 3,
    sprintId: sprintId,
    productGoalId: "goal2",
    title: "Design and implement user profile page",
    priority: "MEDIUM",
    status: "INPROGRESS",
    creatorId: "user1",
    assigneeId: "user2",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z",
  },
  {
    id: "4",
    projectId: projectId,
    point: 2,
    sprintId: sprintId,
    productGoalId: "goal2",
    title: "Setup email notification system",
    priority: "MEDIUM",
    status: "TODO",
    creatorId: "user1",
    assigneeId: "user4",
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "5",
    projectId: projectId,
    point: 13,
    sprintId: sprintId,
    productGoalId: "goal1",
    title: "Implement OAuth integration (Google, GitHub)",
    priority: "HIGH",
    status: "INPROGRESS",
    creatorId: "user1",
    assigneeId: "user3",
    createdAt: "2024-01-11T00:00:00Z",
    updatedAt: "2024-01-26T00:00:00Z",
  },
  {
    id: "6",
    projectId: projectId,
    point: 1,
    sprintId: sprintId,
    productGoalId: "goal2",
    title: "Add user avatar upload feature",
    priority: "LOW",
    status: "TODO",
    creatorId: "user1",
    assigneeId: null,
    createdAt: "2024-01-13T00:00:00Z",
    updatedAt: "2024-01-13T00:00:00Z",
  },
]
