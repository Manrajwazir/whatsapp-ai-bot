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
}
