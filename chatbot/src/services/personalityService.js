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
}
