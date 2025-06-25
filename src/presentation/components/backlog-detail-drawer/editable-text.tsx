"use client";

import { Input } from "@/presentation/components/ui/input";
import { useState } from "react";

interface EditableTextProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export function EditableText({
    value,
    onChange,
    placeholder,
    className,
}: EditableTextProps) {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value);

    return editing ? (
        <Input
            value={temp}
            autoFocus
            onChange={(e) => setTemp(e.target.value)}
            onBlur={() => {
                onChange(temp);
                setEditing(false);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    onChange(temp);
                    setEditing(false);
                }
                if (e.key === "Escape") {
                    setTemp(value);
                    setEditing(false);
                }
            }}
            className={`h-9 text-base px-3 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-0 transition-colors duration-200 ${className}`}
        />
    ) : (
        <h2
            className={`text-2xl font-bold cursor-pointer hover:underline text-gray-800 tracking-tight leading-tight px-0.5 py-1 ${className}`}
            onClick={() => setEditing(true)}
        >
            {value || placeholder || "Untitled Backlog"}
        </h2>
    );
}