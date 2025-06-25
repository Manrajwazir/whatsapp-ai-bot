const { makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const logger = require('../config/logger');
const chatController = require('../controllers/chatController');

class WhatsappService {
    constructor(){
      this.messageQueue = [];
      this.isProcessing = false;
      this.sock = null;
    }

    async initialize() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: logger
      });

      this.setupEventHandlers(saveCreds);
      logger.info('Whatsapp service initialized');

    }catch ( error ){
      logger.error('WhatsApp initialization failed:', error);
      throw error;
    }
  }

  setupEventHandlers(saveCreds) {
    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if ( connection === 'close') {
        this.handleDisconnect(lastDisconnect);
      }
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.upsert', async (m) => {
      try {
        const messgae = m.messages[0];
        if (!this.shouldProcessMessage(message)) return;

        const text = this.extractMessageText(message);
        if(!text) return;

        this.addToQueue(message.key.remoteJid, text);
      } catch (error){
        logger.error('Message processing error:', error);
      }
    });
  }

}

