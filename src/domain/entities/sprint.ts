export interface Sprint {
  id: string
  projectId: string;
  name: string
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}


export interface SprintWithIsCollapsed extends Sprint {
  isCollapsed: boolean
}