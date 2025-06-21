"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { X } from "lucide-react"

import type { ProductBacklog, ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog"
import { Button } from "@/presentation/components/ui/button"
import { Input } from "@/presentation/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select"
import { Drawer, DrawerContent } from "@/presentation/components/ui/drawer"
import { useGetProductBacklogById } from "@/shared/hooks/use-get-product-backlog-by-id"
import { LoadingSpinner } from "../loading/loading-spinner"

function EditableText({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(value)

  return editing ? (
    <Input
      value={temp}
      autoFocus
      onChange={(e) => setTemp(e.target.value)}
      onBlur={() => {
        onChange(temp)
        setEditing(false)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange(temp)
          setEditing(false)
        }
        if (e.key === "Escape") {
          setTemp(value)
          setEditing(false)
        }
      }}
      className="h-8 text-sm"
    />
  ) : (
    <div
      className="text-sm text-gray-800 cursor-pointer hover:underline"
      onClick={() => setEditing(true)}
    >
      {value || placeholder || "-"}
    </div>
  )
}

export function BacklogDetailDrawer() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const backlogId = searchParams.get("backlogId")

  const [open, setOpen] = useState(false)
  const [data, setData] = useState<ProductBacklog | null>(null)
  const [loading, setLoading] = useState(false)

  const { triggerGetProductBacklogById, triggerGetProductBacklogByIdLoading } =
    useGetProductBacklogById(backlogId ?? "")

  useEffect(() => {
    if (backlogId) {
      setOpen(true)
      setLoading(true)
      triggerGetProductBacklogById(backlogId)
        .then((res) => {
          if (res.status === "success") setData(res.data)
          else setData(null)
        })
        .finally(() => setLoading(false))
    } else {
      setOpen(false)
      setData(null)
    }
  }, [backlogId])

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("backlogId")
    navigate({ search: newParams.toString() }, { replace: true })
  }

  return (
    <Drawer open={open} onClose={handleClose} direction="right" shouldScaleBackground={false}>
      <style>{`[data-vaul-overlay] { background-color: transparent !important; }`}</style>
      <DrawerContent className="ml-auto w-full max-w-xl h-full rounded-none border-l border-gray-200 shadow-lg bg-white flex flex-col">
        <div className="flex items-center justify-end px-6 py-3 border-b border-gray-100 bg-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loading || triggerGetProductBacklogByIdLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner message="Memuat backlog..." />
          </div>
        ) : data ? (
          <div className="p-8 space-y-6 overflow-auto flex-1">
            <EditableText
              value={data.title}
              onChange={(val) => setData({ ...data, title: val })}
              placeholder="Judul backlog"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10 text-gray-700">
              {/* STATUS */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <Select
                  value={data.status}
                  onValueChange={(val) =>
                    setData({ ...data, status: val as ProductBacklogStatus })
                  }
                >
                  <SelectTrigger className="h-8 w-full max-w-[200px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="INPROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PRIORITY */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Prioritas</span>
                <Select
                  value={data.priority}
                  onValueChange={(val) =>
                    setData({ ...data, priority: val as ProductBacklogPriority })
                  }
                >
                  <SelectTrigger className="h-8 w-full max-w-[200px]">
                    <SelectValue placeholder="Prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* POINT */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Poin</span>
                <EditableText
                  value={data.point?.toString() ?? ""}
                  onChange={(val) => {
                    const num = parseInt(val)
                    if (!isNaN(num)) setData({ ...data, point: num })
                  }}
                />
              </div>

              {/* PRODUCT GOAL */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Product Goal</span>
                <EditableText
                  value={data.productGoalId ?? ""}
                  onChange={(val) => setData({ ...data, productGoalId: val })}
                  placeholder="Belum ditentukan"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10 flex-1 flex items-center justify-center flex-col">
            <p className="mb-2 text-lg">Detail backlog tidak ditemukan.</p>
            <p className="text-sm">Silakan pilih backlog lain atau coba muat ulang.</p>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
