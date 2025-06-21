"use client"


import { MyTasksSection } from "../components/section/my-tasks-section"
import { ProjectHeaderSection } from "../components/section/project-header-section"
import { ProjectSection } from "../components/section/project-section"

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <ProjectHeaderSection />
      <ProjectSection />
      <MyTasksSection></MyTasksSection>
    </div>
  )
}
