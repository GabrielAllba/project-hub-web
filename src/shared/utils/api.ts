
// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))


// Update item sprint assignment
export async function updateItemSprint(itemId: string, sprintId: string | null): Promise<void> {
  await delay(500) // Simulate network delay
  console.log(`API: Updated item ${itemId} to sprint ${sprintId || "null"}`)
}

// Reorder items within a container
export async function reorderItems(containerId: string | null, itemIds: string[]): Promise<void> {
  await delay(500) // Simulate network delay
  console.log(`API: Reordered items in ${containerId || "backlog"}:`, itemIds)
}
