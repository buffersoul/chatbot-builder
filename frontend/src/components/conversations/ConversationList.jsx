import React, { useState, useEffect } from 'react';
import { getConversations } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const ConversationList = ({ onSelectConversation, selectedId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const data = await getConversations({ page, limit: 10, status: statusFilter, search });
            setConversations(data.conversations);
            setTotalPages(data.pages);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on filter change
            fetchConversations();
        }, 500);

        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    // Handle page change separately to avoid double fetch or debounce issues
    useEffect(() => {
        if (page !== 1) { // Skip initial load if handled by above effect, but usually we need to handle pagination changes immediately
            fetchConversations();
        }
        // If page is 1, the above search/filter effect handles it. 
        // Actually, cleaner logic:
        // Trigger fetch on any change, but debounce search.
    }, [page]);

    // Better implementation:
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchConversations();
        }, 500);

        return () => clearTimeout(timer);
    }, [search, statusFilter, page]);


    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="pb-3 border-b px-6 py-4">
                <CardTitle className="text-xl flex justify-between items-center">
                    Inbox
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </CardTitle>
                <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search visitor..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 mt-2">
                    <Button
                        variant={statusFilter === '' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter('')}
                        className="flex-1"
                    >
                        All
                    </Button>
                    <Button
                        variant={statusFilter === 'active' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter('active')}
                        className="flex-1"
                    >
                        Active
                    </Button>
                    <Button
                        variant={statusFilter === 'closed' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatusFilter('closed')}
                        className="flex-1"
                    >
                        Closed
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                {conversations.length === 0 && !loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No conversations found.
                    </div>
                ) : (
                    <div className="divide-y">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedId === conv.id ? 'bg-muted' : ''}`}
                                onClick={() => onSelectConversation(conv)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {conv.visitor_id.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {conv.visitor_id}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {conv.platform}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground min-w-[60px] text-right">
                                        {formatDate(conv.updated_at || conv.updatedAt || conv.created_at || conv.createdAt)}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {conv.messages && conv.messages.length > 0
                                            ? conv.messages[0].content
                                            : 'No messages'}
                                    </p>
                                </div>
                                <div className="mt-2 flex gap-1">
                                    {conv.status === 'active' && <Badge variant="default" className="text-[10px] h-5">Active</Badge>}
                                    {conv.status === 'closed' && <Badge variant="secondary" className="text-[10px] h-5">Closed</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <div className="p-2 border-t">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink isActive>{page}</PaginationLink>
                        </PaginationItem>

                        {page < totalPages && (
                            <PaginationItem>
                                <PaginationLink onClick={() => setPage(p => p + 1)} className="cursor-pointer">
                                    {page + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
                <div className="text-center text-xs text-muted-foreground mt-2">
                    Page {page} of {totalPages}
                </div>
            </div>
        </Card>
    );
};

export default ConversationList;
