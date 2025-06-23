"use client"

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react"

interface DragState {
  activeId: string | null
  originalContainer: string | null
  currentContainer: string | null
  originalPosition: number
  insertPosition: number
}

interface DragStateContextType {
  dragState: DragState
  setDragState: Dispatch<SetStateAction<DragState>>
  resetDragState: () => void
  dragOverContainer: string | null
  setDragOverContainer: Dispatch<SetStateAction<string | null>>
}

const defaultDragState: DragState = {
  activeId: null,
  originalContainer: null,
  currentContainer: null,
  originalPosition: -1,
  insertPosition: -1,
}

const DragStateContext = createContext<DragStateContextType | undefined>(undefined)

export const DragStateProvider = ({ children }: { children: ReactNode }) => {
  const [dragState, setDragState] = useState<DragState>(defaultDragState)
  const [dragOverContainer, setDragOverContainer] = useState<string | null>(null)

  const resetDragState = () => {
    setDragState(defaultDragState)
    setDragOverContainer(null)
  }

  return (
    <DragStateContext.Provider
      value={{
        dragState,
        setDragState,
        resetDragState,
        dragOverContainer,
        setDragOverContainer,
      }}
    >
      {children}
    </DragStateContext.Provider>
  )
}

export const useDragState = (): DragStateContextType => {
  const context = useContext(DragStateContext)
  if (!context) throw new Error("useDragState must be used within DragStateProvider")
  return context
}
