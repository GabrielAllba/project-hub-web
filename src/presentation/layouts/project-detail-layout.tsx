import { type ReactNode } from "react"
import { IconLayoutDashboard, IconRocket } from "@tabler/icons-react"

interface Props {
    children: ReactNode
    title: string
    tabs: ReactNode
}

export const ProjectLayout = ({ children, title, tabs }: Props) => {
    return (
        <div className="flex flex-col space-y-6">
            {/* Banner Header */}
            <div className="relative rounded-md bg-gradient-to-br from-blue-900 to-[#2563EB] p-6 shadow-md flex items-center justify-between overflow-hidden">
                <div className="flex items-center gap-4 z-10">
                    <div className="bg-white/20 text-white p-2 rounded-lg shadow">
                        <IconLayoutDashboard size={28} />
                    </div>
                    <div>
                        <h1 className=" text-xl font-bold text-white flex items-center gap-2">
                            {title}
                        </h1>
                        <p className="text-sm text-white/70">Project workspace overview</p>
                    </div>
                </div>

                {/* Decorative illustration on top-right */}
                <div className="absolute right-6 top-4 opacity-30 text-white/80">
                    <IconRocket size={64} />
                </div>
            </div>

            {/* Tabs */}
            {tabs}

            {/* Content */}
            <div>{children}</div>
        </div>
    )
}
