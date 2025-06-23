// src/presentation/components/containers/comment-container.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";
import { formatDistanceToNow, parseISO } from "date-fns"; // Untuk formatting waktu relatif
import React from "react";

// Interface untuk props komponen Comment
export interface CommentProps {
    id?: string; // Optional, useful if comments come from API with an ID
    userId: string; // ID of the user who made the comment
    user: {
        name: string;
        avatarUrl?: string;
    };
    content: string;
    createdAt: string; // ISO string or any string parseable by new Date()
}

const Comment: React.FC<CommentProps> = ({ user, createdAt, content }) => {
    // Format the timestamp for display, e.g., "11 minutes ago"
    const timeAgo = formatDistanceToNow(parseISO(createdAt), { addSuffix: true });

    return (
        <div className="flex gap-3 text-sm">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100"> {/* Added background and border */}
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{user.name}</span>
                    <span className="text-gray-500 text-xs">{timeAgo}</span>
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{content}</p> {/* Adjusted margin */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <button className="flex items-center gap-1 hover:underline">
                        Reply Comment
                    </button>
                    <span className="h-1 w-1 rounded-full bg-gray-400"></span> {/* Dot separator */}
                    <button className="flex items-center gap-1 hover:underline">
                        Link Comment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Comment;