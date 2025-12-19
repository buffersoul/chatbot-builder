import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MessageThread from './MessageThread';

const ConversationDetailModal = ({ open, onOpenChange, conversationId }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh] p-0 overflow-hidden flex flex-col">
                <MessageThread conversationId={conversationId} readOnly={true} />
            </DialogContent>
        </Dialog>
    );
};

export default ConversationDetailModal;
