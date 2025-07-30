const logger = require("../config/logger");
const openaiService = require("../services/openaiService");
const profileService = require("../services/profileService");
const chatHistoryService = require("../services/chatHistoryService");

class ChatController {
  async generateReply(userMessage, phone) {
    try {
      const profile = await profileService.getProfileByPhone(phone);
      if (!profile) return "Please complete setup first!";

      await chatHistoryService.addMessage(profile.id, "user", userMessage);

      const history = (await chatHistoryService.getRecentHistory(profile.id))
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((msg) => ({ role: msg.role, content: msg.content }));

      const reply = await openaiService.generateReply(history, profile);

      await chatHistoryService.addMessage(profile.id, "assistant", reply);

      return reply;
    } catch (error) {
      logger.error("Reply generation error:", error);
      return "Oops, something went wrong. Try again!";
    }
  }

  async getFullHistory(phone) {
    try {
      const profile = await profileService.getProfileByPhone(phone);
      if (!profile) return [];

      return await chatHistoryService.getFullHistory(profile.id);
    } catch (error) {
      logger.error("Failed to get chat history:", error);
      return [];
    }
  }
}

module.exports = new ChatController();
