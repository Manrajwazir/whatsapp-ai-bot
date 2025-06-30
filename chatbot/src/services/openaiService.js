const { OpenAI } = require("openai");
const logger = require('../config/logger');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 15000 // 15 second timeout
    });

  }
}

module.exports = new OpenAIService();
