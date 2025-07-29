const logger = require("../config/logger");
const chatHistoryService = require("./chatHistoryService");

class personalityService {
  constructor() {
    this.defaultStyles = {
      girlfriend: "flirty, affectionate, playful",
      boyfriend: "protective, caring, attentive",
    };

    this.defaultTones = {
      girlfriend: "playful and teasing",
      boyfriend: "warm and reassuring",
    };

    this.defaultSampleMsgs = {
      girlfriend: [
        "hey handsome 😘",
        "miss u so much 💖",
        "wish u were here with me",
        "what u doing rn?",
        "u make me smile",
      ],
      boyfriend: [
        "hey beautiful 😘",
        "thinking bout u 💖",
        "how was ur day?",
        "u okay babe?",
        "cant wait to see u",
      ],
    };

    this.defaultNicknames = {
      girlfriend: ["babe", "love", "handsome", "king"],
      boyfriend: ["babe", "love", "beautiful", "queen"],
    };
  }

  async getConfig(profile) {
    try {
      const chatHistory = await chatHistoryService.getRecentHistory(
        profile.id,
        10
      );

      const formattedHistory = chatHistory.reverse().map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const role = profile.role.toLowerCase().includes("gf")
        ? "girlfriend"
        : "boyfriend";

      return {
        userName: profile.userName,
        role,
        userGender: profile.userGender,
        style: profile.style || this.defaultStyles[role],
        tone: profile.tone || this.defaultTones[role],
        sampleMsgs: profile.sampleMsgs?.length
          ? profile.sampleMsgs
          : this.defaultSampleMsgs[role],
        nicknames: profile.nicknames?.length
          ? profile.nicknames
          : this.defaultNicknames[role],
        memories: profile.memories || {},
        conversationHistory: formattedHistory,
      };
    } catch (error) {
      logger.error("Failed to get personality config:", error);
      return this.getFallbackConfig(profile);
    }
  }

  getFallbackConfig(profile) {
    const role = profile.role.toLowerCase().includes("gf")
      ? "girlfriend"
      : "boyfriend";
    return {
      userName: profile.userName,
      role,
      userGender: profile.userGender,
      style: this.defaultStyles[role],
      tone: this.defaultTones[role],
      sampleMsgs: this.defaultSampleMsgs[role],
      nicknames: this.defaultNicknames[role],
      memories: {},
      conversationHistory: [],
    };
  }
}
