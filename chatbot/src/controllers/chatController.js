const logger = require('../config/logger');
const openaiService = require('../services/openaiService');

class ChatController {
    constructor() {
        this.conversationHistory = [];
        this.maxHistoryLength = 30;
    }

    async generateReply(userMessage) {
        try {
            this.addToHistory('user', userMessage);

            const reply = await openaiService.generateReply(this.conversationHistory);

            this.addToHistory('assistant', reply);
            this.manageHistoryLength();

            return reply;
        } catch (error) {
            logger.error('reply generation error: ', error);
            return null;
        }
    }
    
    addToHistory(role, content) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });
    }

    manageHistoryLength() {
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
    }

    getConversationHistory() {
        return this.conversationHistory;
    }
}