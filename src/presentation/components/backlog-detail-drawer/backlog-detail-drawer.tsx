"use client"

import { useBacklog } from "@/shared/contexts/backlog-context"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { CustomDrawer, CustomDrawerContent } from "../drawer/custom-drawer"
import { EmptyStateIllustration } from "../empty/empty-state"
import { LoadingSpinner } from "../loading/loading-spinner"
import { BacklogActivityLog } from "./backlog-activity-log"
import { Button } from "../ui/button"

export function BacklogDetailDrawer() {
  const [open, setOpen] = useState(false)

  const {
    clickedBacklog,
    handleSetClickedBacklog,
    loadMoreBacklogLogs,
    backlogLogs,
    isBacklogLogsLoading,
    isLoadingMoreBacklogLogs,
    hasMoreBacklogLogs,
  } = useBacklog()

  useEffect(() => {
    if (clickedBacklog !== "") {
      setOpen(true)
    }
  }, [clickedBacklog])

  const handleClose = () => {
    setOpen(false)
    handleSetClickedBacklog("")
  }

  return (
    <CustomDrawer open={open} onClose={handleClose} direction="right" shouldScaleBackground={false}>
      <CustomDrawerContent className="bg-white shadow-xl border-none border-0">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 text-slate-500 hover:text-slate-700"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-6 h-full overflow-auto space-y-4">
            {/* Activity Log Section */}
            {isBacklogLogsLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner message="Loading ..." />
              </div>
            ) : backlogLogs && backlogLogs.length > 0 ? (
              <>
                <BacklogActivityLog activityLogs={backlogLogs} />
                {hasMoreBacklogLogs && (
                  <div className="pt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreBacklogLogs}
                      disabled={isLoadingMoreBacklogLogs}
                    >
                      {isLoadingMoreBacklogLogs ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <EmptyStateIllustration type="no-activity" />
              </div>
            )}
          </div>
        </div>
      </CustomDrawerContent>
    </CustomDrawer>
  )
}
