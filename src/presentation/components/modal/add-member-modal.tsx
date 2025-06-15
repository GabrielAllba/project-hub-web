"use client"

import type { ProjectRole } from "@/constants/constants"
import type { User } from "@/domain/entities/user"
import { useInviteDeveloper } from "@/shared/hooks/use-invite-developer"
import { useInviteProductOwner } from "@/shared/hooks/use-invite-product-owner"
import { useInviteScrumMaster } from "@/shared/hooks/use-invite-scrum-master"
import { useSearchUsers } from "@/shared/hooks/use-search-users"
import { cn } from "@/shared/utils/merge-class"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface AddMemberModalProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRole: ProjectRole
}

export const AddMemberModal = ({
  projectId,
  open,
  onOpenChange,
  defaultRole,
}: AddMemberModalProps) => {
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<ProjectRole>(defaultRole)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<{ user: User; role: ProjectRole }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const { triggerSearchUsers } = useSearchUsers()
  const { triggerInviteDeveloper } = useInviteDeveloper(projectId)
  const { triggerInviteProductOwner } = useInviteProductOwner(projectId)
  const { triggerInviteScrumMaster } = useInviteScrumMaster(projectId)

  useEffect(() => {
    if (!search) {
      setSearchResults([])
      setNotFound(false)
      return
    }

    const delayDebounce = setTimeout(() => {
      setIsSearching(true)
      triggerSearchUsers(search)
        .then((res) => {
          setSearchResults(res.data)
          setNotFound(res.data.length === 0)
        })
        .catch(() => {
          setSearchResults([])
          setNotFound(true)
        })
        .finally(() => setIsSearching(false))
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [search])

  useEffect(() => {
    setRole(defaultRole)
  }, [defaultRole, open])

  const handleSelectUser = (user: User) => {
    const alreadySelected = selectedUsers.some((u) => u.user.id === user.id)
    if (!alreadySelected) {
      setSelectedUsers((prev) => [...prev, { user, role }])
    }
    setSearch("")
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user.id !== userId))
  }

  const handleAddMembers = async () => {
    const grouped = {
      DEVELOPER: selectedUsers.filter((u) => u.role === "DEVELOPER"),
      PRODUCT_OWNER: selectedUsers.filter((u) => u.role === "PRODUCT_OWNER"),
      SCRUM_MASTER: selectedUsers.filter((u) => u.role === "SCRUM_MASTER"),
    }

    try {
      if (grouped.DEVELOPER.length > 0) {
        await triggerInviteDeveloper({ userIds: grouped.DEVELOPER.map((u) => u.user.id) })
      }
      if (grouped.PRODUCT_OWNER.length > 0) {
        await triggerInviteProductOwner({ userIds: grouped.PRODUCT_OWNER.map((u) => u.user.id) })
      }
      if (grouped.SCRUM_MASTER.length > 0) {
        await triggerInviteScrumMaster({ userIds: grouped.SCRUM_MASTER.map((u) => u.user.id) })
      }

      setSelectedUsers([])
      onOpenChange(false)
    } catch (error) {
      toast.error(`Invite error: ${error}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-sm">
        <DialogHeader>
          <DialogTitle>Invite people to your project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="text-sm font-medium mb-1 block">Username or email</label>
            <Input
              placeholder="e.g., Maria, maria@company.com"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isSearching ? (
            <p className="text-sm text-muted-foreground">Searching...</p>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "text-sm py-1 px-2 rounded-md hover:bg-accent cursor-pointer flex justify-between items-center"
                )}
                onClick={() => handleSelectUser(user)}
              >
                <div>
                  <p>{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <span className="text-xs text-blue-500 font-medium">Add</span>
              </div>
            ))
          ) : notFound && search ? (
            <p className="text-sm text-muted-foreground">
              No user found for <strong>{search}</strong>
            </p>
          ) : null}

          <div>
            <label className="text-sm font-medium mb-1 block">Role</label>
            <Select value={role} onValueChange={(val: ProjectRole) => setRole(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCRUM_MASTER">Scrum Master</SelectItem>
                <SelectItem value="DEVELOPER">Developer</SelectItem>
                <SelectItem value="PRODUCT_OWNER">Product Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedUsers.length > 0 && (
            <div className="border rounded-md p-2">
              <p className="text-sm font-medium mb-2">Selected Users</p>
              <ul className="space-y-1">
                {selectedUsers.map(({ user, role }) => (
                  <li
                    key={user.id}
                    className="flex justify-between items-center text-sm px-2 py-1 bg-muted rounded-md"
                  >
                    <div>
                      <p>{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-blue-500 font-medium">Role: {role}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={selectedUsers.length === 0} onClick={handleAddMembers}>
            Invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
