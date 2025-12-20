// Chat message types
export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    quickReplies?: QuickReply[];
}

export interface QuickReply {
    id: string;
    text: string;
    action: string;
}

export interface ChatState {
    isOpen: boolean;
    isMinimized: boolean;
    messages: ChatMessage[];
    isTyping: boolean;
}

export type ChatIntent =
    | 'balance_inquiry'
    | 'transaction_status'
    | 'help_request'
    | 'appointment'
    | 'general'
    | 'escalate';
