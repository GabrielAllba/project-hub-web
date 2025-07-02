"use client"

import { Calendar, CheckSquare, List, Users } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"

const tabsData = {
    list: {
        title: "Manage your tasks efficiently",
        subtitle: "List",
        description:
            "A streamlined task view for backlog management. Filter, search, sort and update backlog items in one powerful interface.",
        features: [
            "Compact list-based backlog view",
            "Filtering and search",
            "Quick inline editing",
        ],
        image: "/images/list-preview.png",
        cta: "Get Started",
        icon: List,
    },
    boards: {
        title: "Sprint planning made simple",
        subtitle: "Board",
        description:
            "Manage your Scrum boards effortlessly with visual task tracking, drag-and-drop workflows, and custom statuses. Perfect for sprint planning, standups, and reviews.",
        features: [
            "Kanban-style task management",
            "Drag-and-drop backlog and sprint tasks",
        ],
        image: "/images/board-preview.png",
        cta: "Get Started",
        icon: CheckSquare,
    },
    timeline: {
        title: "Plan your sprints with confidence",
        subtitle: "Timeline",
        description:
            "Visualize your sprint timelines with interactive Gantt charts. Manage dependencies, milestones, and release cycles with precision and flexibility.",
        features: [
            "Gantt-style sprint timeline",
            "Tracking",
            "Drag-to-reschedule functionality",
        ],
        image: "/images/timeline-preview.png",
        cta: "Get Started",
        icon: Calendar,
    },
    team: {
        title: "Empower every Scrum role",
        subtitle: "Team",
        description:
            "Collaborate across Product Owners, Scrum Masters, and Developers. Assign roles, manage team capacity, and keep everyone aligned in one shared workspace.",
        features: [
            "Role-based",
            "Team directory & avatars",
            "Workload and availability tracking",
            "Collaboration",
        ],
        image: "/images/team-preview.png",
        cta: "Get Started",
        icon: Users,
    },
}

const tabOrder = ["list", "boards", "timeline", "team"]

export function FeaturesTabs() {
    const [activeTab, setActiveTab] = useState("list")

    return (
        <section className="py-16 pt-0">
            <div className="px-4 sm:px-6 lg:px-8 w-full">
                <div className="w-full">
                    <div className="flex justify-center mb-16 w-full">
                        <div className="grid grid-cols-2 md:grid-cols-4">
                            {tabOrder.map((key) => {
                                const data = tabsData[key as keyof typeof tabsData]
                                const IconComponent = data.icon
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`cursor-pointer flex flex-col items-center px-8 py-6 text-center transition-colors relative group ${activeTab === key
                                                ? "text-[#1868DB]"
                                                : "text-black hover:text-black border-b-3 border-transparent"
                                            }`}
                                    >
                                        <IconComponent className="h-8 w-8 mb-3" />
                                        <span className="text-2xl font-bold whitespace-nowrap">
                                            {data.subtitle}
                                        </span>
                                        <div
                                            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 bg-[#1868DB] transition-all duration-300 rounded-sm ${activeTab === key ? "opacity-100 w-full" : "opacity-0 w-0"
                                                }`}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                    {tabsData[activeTab as keyof typeof tabsData].title}
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {tabsData[activeTab as keyof typeof tabsData].description}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 mb-4">Key features include:</p>
                                <ul className="space-y-3">
                                    {tabsData[activeTab as keyof typeof tabsData].features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="w-2 h-2 bg-[#1868DB] rounded-full mt-2 mr-4 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-6">
                                <Button
                                    variant="link"
                                    className="text-[#1868DB] hover:text-blue-700 p-0 h-auto font-semibold text-base"
                                >
                                    {tabsData[activeTab as keyof typeof tabsData].cta} →
                                </Button>
                            </div>
                        </div>

                        <div className="lg:pl-8 my-auto mx-auto">
                            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/20 border p-2">
                                <img
                                    src={tabsData[activeTab as keyof typeof tabsData].image || "/placeholder.svg"}
                                    alt={`${tabsData[activeTab as keyof typeof tabsData].subtitle} Preview`}
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute inset-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
