import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";


interface PaginationSectionProps {
    page: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    startItem: number;
    endItem: number;
    setPage: (newPage: number) => void;
    setItemsPerPage: (newCount: number) => void;
}

export const PaginationSection = ({
    page,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem,
    setPage,
    setItemsPerPage,
}: PaginationSectionProps) => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <span>Kartu per halaman</span>

            <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                    setItemsPerPage(Number(val));
                    setPage(0);
                }}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tampilkan" />
                </SelectTrigger>
                <SelectContent>
                    {[5, 10, 15].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                            {n}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <span>
                {startItem} - {endItem} dari {totalItems}
            </span>

            <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(Math.max(page - 1, 0))}
                disabled={page === 0}
            >
                <IconChevronLeft className="w-4 h-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={page + 1 >= totalPages}
            >
                <IconChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
};
