const {
  makeWASocket,
  useMultiFileAuthState,
  delay,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const logger = require("../config/logger");
const onboardingHandler = require("./onboardingHandler");
const profileService = require("./profileService");
const updateHandler = require("./updateHandler");
const chatController = require("../controllers/chatController");
const fs = require("fs");
const path = require("path");

class WhatsAppService {
  constructor() {
    this.messageQueue = [];
    this.isProcessing = false;
    this.sock = null;
    this.qrShown = false;
    this.authDir = "./auth_info";
    this.connectionPromise = null;
    this.isConnected = false;
  }

  async initialize() {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        this.isFirstRun = await profileService.isFirstRun();

        // Clear console and show connection status
        logger.info("🔌 Connecting to WhatsApp...");

        const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

        this.sock = makeWASocket({
          auth: state,
          logger,
          printQRInTerminal: false,
        });

        this.setupEventHandlers(saveCreds);
        resolve();
      } catch (error) {
        logger.error("❌ WhatsApp initialization failed:", error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  async cleanup() {
    if (this.sock) {
      await this.sock.end();
      this.sock = null;
    }
    this.connectionPromise = null;
    this.isConnected = false;
    this.qrShown = false;
  }

  setupEventHandlers(saveCreds) {
    this.sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && !this.qrShown) {
        const credsFile = path.join(this.authDir, "creds.json");
        if (!fs.existsSync(credsFile)) {
          console.log(`
          ██████╗ ██████╗ ████████╗
          ██╔══██╗██╔══██╗╚══██╔══╝
          ██████╔╝██████╔╝   ██║   
          ██╔═══╝ ██╔══██╗   ██║   
          ██║     ██║  ██║   ██║   
          ╚═╝     ╚═╝  ╚═╝   ╚═╝   
          AI Relationship Bot v2.0
          `);
          qrcode.generate(qr, { small: true });
          logger.info("📱 Scan this QR code to connect WhatsApp");
          this.qrShown = true;
        }
        return;
      }

      if (connection === "close") {
        this.handleDisconnect(lastDisconnect);
      } else if (connection === "open") {
        this.isConnected = true;
        logger.info("✅ WhatsApp connection established");
        this.qrShown = false;

        // Start onboarding if needed (after connection is established)
        if (this.isFirstRun && !onboardingHandler.isActive) {
          setTimeout(() => {
            onboardingHandler
              .start()
              .then(() => logger.info("Onboarding started"))
              .catch((err) => logger.error("Onboarding start failed:", err));
          }, 1000);
        }
      }
    });

    this.sock.ev.on("creds.update", saveCreds);

    this.sock.ev.on("messages.upsert", async (m) => {
      try {
        if (!this.isConnected) return;

        const message = m.messages[0];
        if (!message?.message || message.key.fromMe) return;

        const text = this.extractMessageText(message).trim();
        const phone = message.key.remoteJid;

        if (await profileService.isFirstRun()) {
          await this.handleOnBoarding(phone, text);
          return;
        }

        const profile = await profileService.getProfile();
        if (!profile || phone !== profile.partnerPhone) {
          logger.warn(`Ignoring message from non-partner: ${phone}`);
          return;
        }

        if (text.startsWith("/update")) {
          const updateResponse = await updateHandler.handleCommand(phone, text);
          await this.sock.sendMessage(phone, { text: updateResponse });
          return;
        }

        this.addToQueue(phone, text);
      } catch (error) {
        logger.error("❌ Message processing error:", error);
      }
    });
  }

  extractMessageText(message) {
    return (
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      ""
    );
  }

  async handleOnBoarding(phone, text) {
    try {
      if (!onboardingHandler.isActive) {
        await onboardingHandler.start();
      }

      const result = await onboardingHandler.handle(text);
      const responseText =
        result.message || result.error || "An unexpected error occurred";

      if (result.completed) {
        logger.info("🎉 Onboarding completed successfully");
      }

      await this.sock.sendMessage(phone, { text: responseText });
    } catch (error) {
      logger.error("Onboarding error:", error);
      await this.sock.sendMessage(phone, {
        text: "❌ An error occurred during onboarding. Please try again.",
      });
    }
  }

  addToQueue(remoteJid, text) {
    this.messageQueue.push({
      remoteJid,
      text,
      timestamp: Date.now(),
    });

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    this.isProcessing = true;

    try {
      await delay(7000); // Wait for potential message grouping

      if (this.messageQueue.length === 0) {
        this.isProcessing = false;
        return;
      }

      const now = Date.now();
      const recentMessages = this.messageQueue.filter(
        (m) => now - m.timestamp < 7000
      );
      this.messageQueue = this.messageQueue.filter(
        (m) => now - m.timestamp >= 7000
      );

      if (recentMessages.length > 0) {
        await this.handleMessages(recentMessages);
      }
    } catch (error) {
      logger.error("❌ Queue processing error:", error);
    } finally {
      this.isProcessing = false;

      if (this.messageQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  async handleMessages(messages) {
    const remoteJid = messages[0].remoteJid;
    if (!messages.every((m) => m.remoteJid === remoteJid)) {
      logger.error("Mixed remoteJid in message batch");
      return;
    }

    const combinedText = messages.map((m) => m.text).join("\n");
    await delay(1000 + Math.random() * 6000); // Human-like delay

    try {
      const reply = await chatController.generateReply(combinedText, remoteJid);
      if (reply) {
        await this.sock.sendMessage(remoteJid, { text: reply });
      }
    } catch (error) {
      logger.error("Failed to generate/send reply:", error);
    }
  }

  handleDisconnect(lastDisconnect) {
    this.isConnected = false;
    const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
    logger.warn(`Connection closed. Reconnecting: ${shouldReconnect}`);

    if (shouldReconnect) {
      setTimeout(async () => {
        await this.cleanup();
        this.initialize().catch((err) =>
          logger.error("Reconnection failed:", err)
        );
      }, 5000);
    }
  }
}

module.exports = new WhatsAppService();
