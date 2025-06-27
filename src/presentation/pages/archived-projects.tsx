"use client"


import { ArchivedProjectHeaderSection } from "../components/section/archive-project-header-section"
import { ArchiveProjectSection } from "../components/section/archive-project-section"

export const ArchivedProjects = () => {
    return (
        <div className="space-y-6">
            <ArchivedProjectHeaderSection />
            <ArchiveProjectSection />
        </div>
    )
}
