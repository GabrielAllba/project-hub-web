import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Checkbox } from "../../ui/checkbox";
import { Separator } from "../../ui/separator";

export const BacklogSidebar = () => {
  const groups = [
    "Tanpa Group asdfaslkdfjasldkfjadsklfjakldsfjadsklfj",
    "Eksplorasi",
    "Autentikasi",
    "Lainnya",
  ];

  const [checkedGroups, setCheckedGroups] = useState<string[]>([]);

  const toggleGroup = (group: string) => {
    setCheckedGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  return (
    <aside className="w-64 h-fit">
      <Card className="shadow-none border border-border rounded-md">
        <CardContent className="p-4 py-3">
          <h3 className="text-sm font-semibold mb-4">Group Tugas</h3>

          <div className="space-y-2">
            {groups.map((group) => {
              const isChecked = checkedGroups.includes(group);
              return (
                <label
                  key={group}
                  className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer select-none
                    ${isChecked ? "bg-primary/10" : "bg-muted"}
                    hover:bg-primary/20 transition-colors`}
                >
                  <div className="flex items-center space-x-2 max-w-[12rem]">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleGroup(group)}
                      aria-label={`Pilih grup tugas ${group}`}
                    />
                    <span className="text-sm text-foreground truncate">
                      {group}
                    </span>
                  </div>
                  <Pencil
                    className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Edit group: ${group}`);
                    }}
                  />
                </label>
              );
            })}
          </div>

          <Separator className="my-4" />

          <Button variant="link" className="text-sm px-0 h-auto">
            + Group Tugas
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};
