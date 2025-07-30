const prisma = require("../db");
const logger = require("../config/logger");

class ChatHistoryService {
  constructor() {
    this.historyLimit = parseInt(process.env.CHAT_HISTORY_LIMIT) || 100;
  }
  async addMessage(profileId, role, content) {
    // Input validation
    if (!profileId || !role || !content) {
      throw new Error("Missing required parameters");
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Add new message
        await tx.chatHistory.create({
          data: { role, content, profileId },
        });

        // Clean up old messages if needed
        const count = await tx.chatHistory.count({
          where: { profileId },
        });

        if (count > this.historyLimit) {
          const excess = count - this.historyLimit;
          await tx.chatHistory.deleteMany({
            where: {
              profileId,
              id: {
                in: await tx.chatHistory
                  .findMany({
                    where: { profileId },
                    orderBy: { createdAt: "asc" },
                    take: excess,
                    select: { id: true },
                  })
                  .then((msgs) => msgs.map((m) => m.id)),
              },
            },
          });
        }
      });
    } catch (error) {
      logger.error("Failed to save chat history:", error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  async getRecentHistory(profileId, limit = 20) {
    try {
      return await prisma.chatHistory.findMany({
        where: { profileId },
        orderBy: { createdAt: "desc" },
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
