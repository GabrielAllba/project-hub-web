import type { ProductBacklog } from "@/domain/entities/product-backlog"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { DroppableContainer } from "../../containers/droppable-container"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { ProductBacklogItem } from "./product-backlog-item"

export function ProductBacklogContainer({
    items,
    isLoading,
}: {
    items: ProductBacklog[]
    isLoading: boolean
}) {
    return (
        <Card className="w-full rounded-sm ">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold ">Product Backlog</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            {isLoading ? "..." : items.length}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-20">
                        <p className="text-sm">Loading items...</p>
                    </div>
                ) : (
                    <DroppableContainer id="product-backlog" className="min-h-[100px]">
                        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-0">
                                {items.map((item) => (
                                    <ProductBacklogItem
                                        key={item.id}
                                        backlog={item} />
                                ))}
                                {items.length === 0 && (
                                    <div className="flex items-center justify-center h-20 text-sm border-2 border-dashed rounded-lg text-gray-400">
                                        Drop items here
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DroppableContainer>
                )}
            </CardContent>
        </Card>
    )
}
