import { Search } from "lucide-react"
import { Card, CardContent } from "../ui/card"

export const EmptyState = () => {
    return (
        <Card className="rounded-sm">
            <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">No Sprint Selected</h3>
                    <p className="text-muted-foreground">
                        Select a sprint from the search above to view its detailed task assignments and progress.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
