import { Card, CardContent } from "../ui/card"

export const LoadingState = () => {
    return (
        <Card className="rounded-sm">
            <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Generating sprint report...</p>
                </div>
            </CardContent>
        </Card>
    )
}
