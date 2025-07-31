const readline = require("readline");
const onboardingHandler = require("./onboardingHandler");
const logger = require("../config/logger");

class ConsoleOnboarder {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start() {
    console.log("\n=== FIRST-TIME SETUP ===\n");

    // Start the onboarding handler
    const initialMessage = await onboardingHandler.start();
    console.log(initialMessage);

    this.rl.on("line", async (input) => {
      const result = await onboardingHandler.handle(input.trim());

      if (result.error) {
        console.log(result.error);
      } else if (result.message) {
        console.log("\n" + result.message);
      }

      if (result.completed) {
        this.rl.close();
        console.log("\n✅ Setup complete! Starting WhatsApp service...");
      }
    });
  }
}

module.exports = new ConsoleOnboarder();
