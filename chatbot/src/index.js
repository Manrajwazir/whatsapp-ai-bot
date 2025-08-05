require("dotenv").config();
const express = require("express");
const path = require("path");
const logger = require("./config/logger");

const whatsappService = require("./services/whatsappService");
const chatController = require("./controllers/chatController");
const profileController = require("./controllers/profileController");
const profileService = require("./services/profileService");
const prisma = require("./db");

class Application {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
  }

  async initialize() {
    try {
      await this.setupDatabase();

      // Check if we need onboarding
      if (await profileService.isFirstRun()) {
        logger.info("🆕 No profile found. Starting console onboarding...");
        const consoleOnboarder = require("./services/consoleOnboarder");
        await consoleOnboarder.start(); // Wait for onboarding to finish
      }

      this.setupMiddleware();
      this.setupRoutes();
      this.startServices();
      this.startServer();
      this.setupTerminal(); // 🧠 Start reading /update input after onboarding
    } catch (error) {
      logger.error("Application initialization failed:", error);
      process.exit(1);
    }
  }

  async setupDatabase() {
    try {
      await prisma.$connect();
      logger.info("✅ Database connected successfully");
    } catch (error) {
      logger.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, "../public")));
  }

  setupRoutes() {
    this.app.get("/profile", async (req, res) => {
      try {
        const profile = await profileController.getProfile();
        res.json(profile || {});
      } catch (error) {
        logger.error("Failed to fetch profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
      }
    });

    this.app.get("/history", async (req, res) => {
      try {
        const profile = await profileController.getProfile();
        if (!profile) return res.json([]);

        const history = await chatController.getFullHistory(
          profile.partnerPhone
        );
        res.json(history);
      } catch (error) {
        logger.error("Failed to fetch chat history:", error);
        res.status(500).json({ error: "Failed to fetch history" });
      }
    });

    this.app.post("/update-memory", async (req, res) => {
      const { key, value } = req.body;
      if (!key || !value) {
        return res
          .status(400)
          .json({ error: "Memory key and value are required" });
      }

      try {
        const profile = await profileController.getProfile();
        if (!profile)
          return res.status(400).json({ error: "No profile found" });

        const updatedMemories = { ...(profile.memories || {}) };
        updatedMemories[key] = value;

        await profileService.updateProfile({ memories: updatedMemories });
        res.json({ success: true });
      } catch (error) {
        logger.error("Failed to update memory:", error);
        res.status(500).json({ error: "Failed to update memory" });
      }
    });

    this.app.post("/reset", async (req, res) => {
      try {
        await prisma.profile.deleteMany({});

        // Kill WhatsApp service
        whatsappService.sock?.end();
        whatsappService.sock = null;

        // Clear auth info
        require("fs").rmSync("./auth_info", { recursive: true, force: true });

        // Start new onboarding
        const consoleOnboarder = require("./services/consoleOnboarder");
        await consoleOnboarder.start();

        res.json({ success: true });
      } catch (error) {
        logger.error("Reset failed:", error);
        res.status(500).json({ error: "Reset failed" });
      }
    });
  }

  startServices() {
    whatsappService.initialize().catch((error) => {
      logger.error("Failed to initialize WhatsApp service:", error);
    });
  }

  startServer() {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Server running on port ${this.port}`);
      console.log(`✅ Dashboard: http://localhost:${this.port}`);
    });
  }

  setupTerminal() {
    const readline = require("readline");

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    this.rl.on("line", async (input) => {
      if (input.startsWith("/update")) {
        const profile = await profileController.getProfile();
        if (!profile) {
          console.log("❌ Complete onboarding first!");
          return;
        }

        const response =
          await require("./services/updateHandler").handleCommand(
            profile.partnerPhone,
            input
          );
        console.log(response);
      }
    });
  }
}

new Application().initialize();
