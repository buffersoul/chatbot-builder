import React, { useState } from 'react';
import ConversationList from '../components/conversations/ConversationList';
import ConversationDetailModal from '../components/conversations/ConversationDetailModal';

const ConversationsPage = () => {
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectConversation = (conversation) => {
        setSelectedConversationId(conversation.id);
        setIsModalOpen(true);
    };

    return (
        <div className="h-full p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
                <p className="text-muted-foreground">Manage user conversations and view history.</p>
            </div>

            <div className="bg-background border rounded-lg shadow-sm">
                <ConversationList
                    onSelectConversation={handleSelectConversation}
                    selectedId={selectedConversationId}
                />
            </div>

            <ConversationDetailModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                conversationId={selectedConversationId}
            />
        </div>
    );
};

export default ConversationsPage;
