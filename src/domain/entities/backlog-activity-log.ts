import type { BacklogActivityType } from "@/constants/constants"


export interface BacklogActivityLog {
    id: string
    backlogId: string
    userId: string
    username: string
    activityType: BacklogActivityType
    description: string
    oldValue: string | null
    newValue: string | null
    createdAt: string
}
