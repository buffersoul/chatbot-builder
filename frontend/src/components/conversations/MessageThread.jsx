import React, { useState, useEffect, useRef } from 'react';
import { getConversationDetails, replyToConversation } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, Bot, User, MoreVertical } from 'lucide-react';

const MessageThread = ({ conversationId, readOnly = false }) => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    const fetchMessages = async () => {
        if (!conversationId) return;
        // Don't show full loading spinner for simple refresh, maybe?
        // But for initial load yes.
        if (messages.length === 0) setLoading(true);
        try {
            const data = await getConversationDetails(conversationId);
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Failed to load conversation", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMessages([]); // Clear on switch
        fetchMessages();
    }, [conversationId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [messages, loading, sending]);


    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || sending) return;

        const content = inputValue.trim();
        setInputValue('');
        setSending(true);

        const tempId = 'temp-' + Date.now();

        // Optimistic update
        const tempMsg = {
            id: tempId,
            role: 'assistant', // Admin replying acts as assistant/agent
            content: content,
            created_at: new Date().toISOString(),
            direction: 'outbound'
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const sentMessage = await replyToConversation(conversationId, content);

            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? sentMessage : m));

        } catch (error) {
            console.error("Failed to send message", error);
            // Revert
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setSending(false);
        }
    };

    // Safe time formatter
    const formatTime = (dateString) => {
        try {
            if (!dateString) return '';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(date);
        } catch (e) {
            return '';
        }
    };

    if (!conversationId) {
        // ... (lines 86-90) ...
    }

    if (loading) {
        // ... (lines 94-98) ...
    }

    return (
        <Card className="h-full flex flex-col border-l-0 rounded-l-none shadow-none border-0 w-full">
            <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
                {/* ... header content ... */}
                <div>
                    <CardTitle className="text-lg">Conversation</CardTitle>
                    <p className="text-xs text-muted-foreground">{conversationId}</p>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative min-h-0">
                <ScrollArea className="h-full w-full p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isUser = msg.direction === 'inbound' || msg.role === 'user';
                            return (
                                <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'} gap-2 group`}>
                                    {isUser && (
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isUser
                                        ? 'bg-muted text-foreground rounded-tl-none'
                                        : 'bg-primary text-primary-foreground rounded-tr-none'
                                        }`}>
                                        <p>{msg.content}</p>
                                        <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>

                                    {!isUser && (
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
            {/* ... footer ... */}

            {!readOnly && (
                <CardFooter className="p-3 border-t bg-background">
                    <form onSubmit={handleSend} className="flex gap-2 w-full">
                        <Input
                            placeholder="Type a reply..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={sending}
                        />
                        <Button type="submit" size="icon" disabled={sending || !inputValue.trim()}>
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </CardFooter>
            )}
        </Card>
    );
};

export default MessageThread;
