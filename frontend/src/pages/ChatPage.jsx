import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { sendChatMessage, getChatHistory } from '../lib/api';
import ChatBubble from '../components/chat/ChatBubble';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Send, Bot, RefreshCw } from 'lucide-react';

const ChatPage = () => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Optimistic UI update
        const tempMsg = { role: 'user', content: userMessage, id: 'temp-' + Date.now() };
        setMessages(prev => [...prev, tempMsg]);
        setIsLoading(true);

        try {
            // If user is logged in, use their company ID context
            // In real widget, this would be injected via props or config
            if (!user || !user.company_id) {
                // If user.company_id is missing, try to use company context from store
                const { company } = useAuthStore.getState();
                if (company && company.id) {
                    // proceed with company.id
                } else {
                    throw new Error("User context missing");
                }
            }

            const companyId = user.company_id || useAuthStore.getState().company?.id;

            const response = await sendChatMessage(companyId, userMessage, user.id);

            // Response contains: { response, conversationId, sources }
            if (response.conversationId && !conversationId) {
                setConversationId(response.conversationId);
            }

            const botMsg = {
                role: 'assistant',
                content: response.response,
                sources: response.sources,
                id: 'bot-' + Date.now()
            };

            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg = {
                role: 'system',
                content: "Error sending message. Please try again.",
                id: 'err-' + Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl h-[calc(100vh-100px)]">
            <Card className="h-full flex flex-col shadow-lg border-2">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-primary" />
                        AI Assistant Preview
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <Bot className="w-16 h-16 mb-4" />
                            <p>Ask me anything about your documents!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <ChatBubble
                                key={msg.id}
                                role={msg.role}
                                content={msg.content}
                                sources={msg.sources}
                            />
                        ))
                    )}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse p-4">
                            <Bot className="w-4 h-4" />
                            Thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                <CardFooter className="border-t p-4 bg-muted/10">
                    <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ChatPage;
