import { type ReactNode } from "react";

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

                </div>

                {tabs}

                {children}
            </div>
        </div>
    );
};