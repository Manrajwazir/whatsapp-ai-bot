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

class WhatsAppService {
  constructor() {
    this.messageQueue = [];
    this.isProcessing = false;
    this.sock = null;
  }

  async initialize() {
    try {
      this.isFirstRun = await profileService.isFirstRun();

      const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

      this.sock = makeWASocket({
        auth: state,
        logger,
        printQRInTerminal: false,
      });

      this.setupEventHandlers(saveCreds);
      logger.info("✅ WhatsApp service initialized");
    } catch (error) {
      logger.error("❌ WhatsApp initialization failed:", error);
      throw error;
    }
  }

  setupEventHandlers(saveCreds) {
    this.sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrcode.generate(qr, { small: true });
        logger.info("📱 Scan the QR code above to log in.");
      }

      if (connection === "close") {
        this.handleDisconnect(lastDisconnect);
      } else if (connection === "open") {
        logger.info("✅ Successfully connected to WhatsApp");
      }
    });

    this.sock.ev.on("creds.update", saveCreds);

    this.sock.ev.on("messages.upsert", async (m) => {
      try {
        const message = m.messages[0];
        if (!message?.message || message.key.fromMe) return;

        const text = this.extractMessageText(message).trim();
        const phone = message.key.remoteJid;

        if (await this.isFirstRun()) {
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
    if (!onboardingHandler.isActive) {
      await onboardingHandler.start();
    }

    const result = await onboardingHandler.handle(text);
    const responseText =
      result.message || result.error || "An unexpected error occurred";
    await this.sock.sendMessage(phone, {
      text: responseText,
    });

    if (result.completed) {
      logger.info("🎉 Onboarding completed successfully");
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
    // Ensure all messages are from the same sender
    if (!messages.every((m) => m.remoteJid === remoteJid)) {
      logger.error("Mixed remoteJid in message batch");
      return;
    }
    const combinedText = messages.map((m) => m.text).join("\n"); // Human-like delay (1-5 seconds)
    await delay(1000 + Math.random() * 6000);

    const reply = await chatController.generateReply(combinedText, remoteJid);

    if (reply) {
      await this.sock.sendMessage(remoteJid, { text: reply });
    }
  }

  handleDisconnect(lastDisconnect) {
    const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
    logger.warn(`Connection closed. Reconnecting: ${shouldReconnect}`);

    if (shouldReconnect) {
      setTimeout(() => this.initialize(), 5000);
    }
  }
}

module.exports = new WhatsAppService();
