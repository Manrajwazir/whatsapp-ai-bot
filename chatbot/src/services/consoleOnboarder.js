const readline = require("readline");
const onboardingHandler = require("./onboardingHandler");
const logger = require("../config/logger");

class ConsoleOnboarder {
  constructor() {
    this.rl = null;
  }

  start() {
    return new Promise((resolve) => {
      console.log(`
  ██████╗ ██████╗ ████████╗
  ██╔══██╗██╔══██╗╚══██╔══╝
  ██████╔╝██████╔╝   ██║   
  ██╔═══╝ ██╔══██╗   ██║   
  ██║     ██║  ██║   ██║   
  ╚═╝     ╚═╝  ╚═╝   ╚═╝   
  AI Relationship Bot v2.0
      `);

      setTimeout(async () => {
        console.log("\n=== FIRST-TIME SETUP ===\n");

        const initialMessage = await onboardingHandler.start();
        console.log(initialMessage);

        this.rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

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
            resolve(); // Let the main app know onboarding is done
          }
        });
      }, 1000);
    });
  }
}

module.exports = new ConsoleOnboarder();
