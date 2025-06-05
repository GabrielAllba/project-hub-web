export interface ReorderProductBacklogRequestDTO {
    activeId: string | null
    originalContainer: string | null
    currentContainer: string | null
    insertPosition: number
}
