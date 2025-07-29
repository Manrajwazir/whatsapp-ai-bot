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

  async handlePartnerNumber(input) {
    const parts = input.split(",").map((s) => s.trim());
    if (
      parts.length !== 2 ||
      !/^\d{1,3}$/.test(parts[0]) ||
      !/^\d{10,15}$/.test(parts[1])
    ) {
      return { error: "❌ Invalid format. Example: 91, 9876543210" };
    }
    this.data.partnerPhone = `${parts[0]}${parts[1]}@s.whatsapp.net`;
    return { success: true };
  }

  async handleStyle(input) {
    this.data.style = input.trim();
    return { success: true };
  }

  async handleTone(input) {
    this.data.tone = input.trim();
    return { success: true };
  }

  async handleSampleMessages(input) {
    const samples = input
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s);
    if (samples.length < 2) {
      return {
        error: "❌ Please provide at least 2 messages separated by '|'",
      };
    }
    this.data.sampleMsgs = samples;
    return { success: true };
  }

  async handleNicknames(input) {
    const nicknames = input
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n);
    if (nicknames.length === 0) {
      return { error: "❌ Please provide at least one nickname" };
    }
    this.data.nicknames = nicknames;
    return { success: true };
  }

  async completeSetup() {
    try {
      const profile = await profileService.createProfile(this.data);
      return {
        message: `✅ Setup complete! I'll now reply to ${this.data.partnerPhone} as *you*!\nUse /update to change your style later.`,
        completed: true,
        profile,
      };
    } catch (error) {
      logger.error("Setup failed:", error);
      return { error: "❌ Setup failed. Please try again." };
    }
  }
}
