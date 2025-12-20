import { ChatMessage, QuickReply } from './types';
import { v4 as uuidv4 } from 'uuid';
import { apiClient } from '@/services/api/client';
import { ApiResponse } from '@/types/api.types';

interface ChatResponse {
    id: string;
    text: string;
    sender: string;
    timestamp: string;
    quickReplies?: QuickReply[];
}

/**
 * AI Chatbot Service
 * Handles chat logic, intent detection, and response generation
 */
class ChatService {
    /**
     * Process user message and generate bot response
     */
    async processMessage(userMessage: string): Promise<ChatMessage> {
        try {
            const response = await apiClient.post<ApiResponse<{ data: ChatResponse }>>(
                '/chat/process',
                { text: userMessage }
            );

            const botData = response.data.data.data;

            return {
                id: botData.id,
                text: botData.text,
                sender: 'bot',
                timestamp: new Date(botData.timestamp),
                quickReplies: botData.quickReplies,
            };
        } catch (error) {
            console.error('Chat processing failed:', error);
            // Fallback to offline message
            return {
                id: uuidv4(),
                text: "I'm having trouble connecting to my brain right now. Please try again later!",
                sender: 'bot',
                timestamp: new Date(),
            };
        }
    }

    // Removed unused mock methods

    /**
     * Get initial greeting message
     */
    getGreeting(): ChatMessage {
        return {
            id: uuidv4(),
            text: "Hello! I'm Aadhya, your AI banking assistant. 👋\n\nI'm here 24/7 to help you with your banking needs. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date(),
            quickReplies: [
                { id: '1', text: 'Check balance', action: 'balance_inquiry' },
                { id: '2', text: 'Recent transactions', action: 'transaction_status' },
                { id: '3', text: 'Make payment', action: 'make_payment' },
                { id: '4', text: 'Need help', action: 'help_request' },
            ],
        };
    }
}

export const chatService = new ChatService();
