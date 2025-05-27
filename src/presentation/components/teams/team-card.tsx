import type { TeamSummary } from "@/domain/entities/team-summary";
import { FileText, MoreHorizontal } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface TeamCardProps {
    team: TeamSummary;
}

export const TeamCard = ({ team }: TeamCardProps) => {


    return (
        <Card className="rounded-md shadow-sm hover:shadow-md transition gap-2 py-4">
            <CardHeader className="flex flex-row justify-between items-start">
                <Badge className={`text-xs border`}>
                    {team.name}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">Arsipkan</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="flex items-center gap-2 font-medium text-sm">
                    <FileText className="w-4 h-4" />
                    <CardTitle className="text-base font-semibold truncate block">
                        {team.name}
                    </CardTitle>
                </div>
            </CardContent>
        </Card>
    );
};
