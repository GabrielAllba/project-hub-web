// src/shared/contexts/board-filter-context.ts
import type { ProductBacklogPriority, ProductBacklogStatus } from "@/domain/entities/product-backlog";
import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";

interface BoardFilterContextType {
    selectedSprintId: string | null;
    setSelectedSprintId: Dispatch<SetStateAction<string | null>>;
    selectedPriorities: ProductBacklogPriority[];
    setSelectedPriorities: Dispatch<SetStateAction<ProductBacklogPriority[]>>;
    selectedStatus: ProductBacklogStatus | undefined; // New
    setSelectedStatus: Dispatch<SetStateAction<ProductBacklogStatus | undefined>>; // New
    selectedSearch: string; // New
    setSelectedSearch: Dispatch<SetStateAction<string>>; // New
    selectedAssigneeIds: string[]; // New
    setSelectedAssigneeIds: Dispatch<SetStateAction<string[]>>; // New
}

const BoardFilterContext = createContext<BoardFilterContextType | undefined>(undefined);

interface BoardFilterProviderProps {
    children: React.ReactNode;
}

export const BoardFilterProvider: React.FC<BoardFilterProviderProps> = ({ children }) => {
    const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
    const [selectedPriorities, setSelectedPriorities] = useState<ProductBacklogPriority[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<ProductBacklogStatus | undefined>(undefined); // New
    const [selectedSearch, setSelectedSearch] = useState<string>(""); // New
    const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]); // New

    return (
        <BoardFilterContext.Provider
            value={{
                selectedSprintId,
                setSelectedSprintId,
                selectedPriorities,
                setSelectedPriorities,
                selectedStatus,
                setSelectedStatus,
                selectedSearch,
                setSelectedSearch,
                selectedAssigneeIds,
                setSelectedAssigneeIds,
            }}
        >
            {children}
        </BoardFilterContext.Provider>
    );
};

export const useBoardFilters = () => {
    const context = useContext(BoardFilterContext);
    if (context === undefined) {
        throw new Error("useBoardFilters must be used within a BoardFilterProvider");
    }
    return context;
};