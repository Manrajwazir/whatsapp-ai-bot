const prisma = require("@prisma/client");
const logger = require("../config/logger");

class ChatHistoryService {
  constructor() {
    this.historyLimit = parseInt(process.env.CHAT_HISTORY_LIMIT) || 100;
  }

  async addMessage(profileId, role, content) {
    try {
      await prisma.chatHistory.create({
        data: {
          role,
          content,
          profileId,
        },
      });

      const count = await prisma.chatHistory.count({
        where: { profileId },
      });

      if (count > this.historyLimit) {
        const oldestMessages = await prisma.chatHistory.findMany({
          where: { profileId },
          orderBy: { timestamp: "asc" },
          take: count - this.historyLimit,
          select: { id: true },
        });

        await prisma.chatHistory.deleteMany({
          where: {
            id: { in: oldestMessages.map((m) => m.id) },
          },
        });
      }
    } catch (error) {
      logger.error("Failed to save chat history:", error);
    }
  }

  async getRecentHistory(profileId, limit = 20) {
    try {
      return await prisma.chatHistory.findMany({
        where: { profileId },
        orderBy: { timestamp: "desc" },
        take: limit,
      });
    } catch (error) {
      logger.error("Failed to fetch chat history:", error);
      return [];
    }
  }

  async getFullHistory(profileId) {
    try {
      return await prisma.chatHistory.findMany({
        where: { profileId },
        orderBy: { timestamp: "asc" },
      });
    } catch (error) {
      logger.error("Failed to fetch full chat history:", error);
      return [];
    }
  }
}

module.exports = new ChatHistoryService();
