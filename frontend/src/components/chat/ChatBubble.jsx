import React from 'react';
import { cn } from "@/lib/utils";

const ChatBubble = ({ role, content, sources }) => {
    const isUser = role === 'user';

    return (
        <div className={cn("flex w-full mt-2 space-x-3 max-w-md", isUser ? "ml-auto justify-end" : "")}>
            <div className={cn(
                "flex flex-col p-3 rounded-lg text-sm",
                isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
            )}>
                <p className="whitespace-pre-wrap">{content}</p>

                {sources && sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-primary-foreground/20 text-xs opacity-90">
                        <p className="font-semibold mb-1">Sources:</p>
                        <ul className="list-disc list-inside">
                            {sources.map((source, idx) => (
                                <li key={idx} className="truncate max-w-[200px]">{source}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatBubble;
