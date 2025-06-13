import { type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface Props {
    children: ReactNode;
    title: string;
    tabs: ReactNode;
}

export const ProjectLayout = ({ children, title, tabs }: Props) => {
    return (
        <div className="flex">
            <div className="flex-1 px-8 py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        {title} <span className="text-xl cursor-pointer">✏️</span>
                    </h1>
                    <div className="flex -space-x-2 items-center">
                        <Avatar className="w-8 h-8 ring-2 ring-white">
                            <AvatarImage src="/avatar1.png" />
                            <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                        <Avatar className="w-8 h-8 ring-2 ring-white">
                            <AvatarImage src="/avatar2.png" />
                            <AvatarFallback>CD</AvatarFallback>
                        </Avatar>
                        <span className="ml-3 text-sm text-muted-foreground">+7</span>
                    </div>
                </div>

                {tabs}

                {children}
            </div>
        </div>
    );
};