const prisma = require("../db");
const logger = require("../config/logger");
const profileService = require("./profileService");

const STEPS = {
  ROLE: 0,
  USER_DETAILS: 1,
  PARTNER_NUMBER: 2,
  STYLE: 3,
  TONE: 4,
  SAMPLE_MSGS: 5,
  NICKNAMES: 6,
  COMPLETE: 7,
};

class OnboardingHandler {
  constructor() {
    this.currenStep = STEPS.ROLE;
    this.data = {};
    this.isActive = false;
  }

  async start() {
    this.currentStep = STEPS.ROLE;
    this.data = {};
    this.isActive = true;
    return this.getStepMessage(STEPS.ROLE);
  }

  async handle(input) {
    if (!this.isActive) return { error: "Onboarding not active" };

    try {
      const result = await this.processStep(input);
      if (result.error) return result;

      if (this.currentStep === STEPS.NICKNAMES) {
        this.currenStep = STEPS.COMPLETE;
        this.isActive = false;
        return await this.completeSetup();
      }

      this.currentStep++;
      return { message: this.getStepMessage(this.currentStep) };
    } catch (error) {
      logger.error("Onboarding error:", error);
      return { error: "An error occurred during onboarding" };
    }
  }

  async processStep(input) {
    switch (this.currentStep) {
      case STEPS.ROLE:
        return this.handleRole(input);
      case STEPS.USER_DETAILS:
        return this.handleUserDetails(input);
      case STEPS.PARTNER_NUMBER:
        return this.handlePartnerNumber(input);
      case STEPS.STYLE:
        return this.handleStyle(input);
      case STEPS.TONE:
        return this.handleTone(input);
      case STEPS.SAMPLE_MSGS:
        return this.handleSampleMessages(input);
      case STEPS.NICKNAMES:
        return this.handleNicknames(input);
      default:
        return { error: "Invalid onboarding step" };
    }
  }

  getStepMessage(step) {
    const messages = {
      [STEPS.ROLE]:
        "👋 I'm your texting assistant! Are *you* the boyfriend or the girlfriend in the relationship? (Type 'bf' or 'gf')",
      [STEPS.USER_DETAILS]:
        "Great! Now tell me about you:\n1. Your name\n2. Your gender (male/female/other)\n\nFormat:\nJohn Doe, male",
      [STEPS.PARTNER_NUMBER]:
        "📱 What's your partner's number?\nProvide:\n1. Country code (no +)\n2. Phone number\n\nExample: 91, 9876543210",
      [STEPS.STYLE]:
        "💑 How should I behave as *you*? (romantic, clingy, teasing, shy, possessive, etc.):",
      [STEPS.TONE]:
        "✍️ What tone should I use when texting? (e.g. playful, sarcastic, formal, emotional):",
      [STEPS.SAMPLE_MSGS]:
        "💬 Give 2 example messages *you* would send to your partner (separated by '|'):\nExample: hey baby|how was ur day",
      [STEPS.NICKNAMES]:
        "💖 List the nicknames your partner calls you (comma-separated):",
    };
    return messages[step];
  }

  async handleRole(input) {
    const role = input.toLowerCase().trim();
    if (!["gf", "bf"].includes(role)) {
      return { error: "❌ Please enter 'gf' or 'bf'" };
    }
    this.data.role = role === "bf" ? "boyfriend" : "girlfriend";
    return { success: true };
  }

  async handleUserDetails(input) {
    const parts = input.split(",").map((s) => s.trim());
    if (parts.length < 2) {
      return {
        error: "❌ Please provide both name and gender separated by comma",
      };
    } else if (parts.length > 2) {
      return {
        error:
          "❌ Please dont provide anything more than your name and gender separated by comma",
      };
    }
    this.data.userName = parts[0];
    this.data.userGender = parts[1];
    return { success: true };
  }
}
