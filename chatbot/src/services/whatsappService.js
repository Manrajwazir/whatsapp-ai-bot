const { makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const fs = require('fs').promises;
const logger = require('../config/logger');
const chatController = require('../controllers/chatController');

class WhatsappService {
    constructor() {
        this.messageQueue = [];
        this.isProcessing = false;
        this.sock = null;
    }

    async initialize() {
        try {
            if (fs.existsSync('./auth_info')) {
                await fs.rm('./auth_info', { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

            const baileysLogger = {
                level: 'warn',
                trace: () => {},
                debug: () => {},
                info: (message) => logger.info(`[Baileys] ${message}`),
                warn: (message) => logger.warn(`[Baileys] ${message}`),
                error: (message) => logger.error(`[Baileys] ${message}`),
                fatal: (message) => logger.error(`[Baileys CRITICAL] ${message}`)
            };

            this.sock = makeWASocket({
                auth: state,
                printQRInTerminal: true,
                logger: baileysLogger,
                syncFullHistory: false,
                mobile: false
            });

            this.sock.ev.on('connection.update', (update) => {
                if (update.qr) logger.info('Scan QR code to authenticate');
                if (update.connection === 'open') {
                    logger.info('✅ Authenticated successfully');
                }
                if (update.connection === 'close') {
                    this.handleDisconnect(update.lastDisconnect);
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('messages.upsert', async (m) => {
                try {
                    const message = m.messages[0];
                    if (!this.shouldProcessMessage(message)) return;

                    const text = this.extractMessageText(message);
                    if (!text) return;

                    this.addToQueue(message.key.remoteJid, text);
                } catch (error) {
                    logger.error('Message processing error:', error);
                }
            });

            logger.info('Whatsapp service initialized');
        } catch (error) {
            logger.error('WhatsApp initialization failed:', error);
            throw error;
        }
    }

    shouldProcessMessage(message) {
        if (!message?.key?.remoteJid) return false;
        
        const sanitizedNumber = process.env.GIRLFRIEND_NUMBER.replace(/[^0-9]/g, '');
        const isFromTarget = message.key.remoteJid.includes(sanitizedNumber);
        
        return (
            !message.key.fromMe &&
            isFromTarget &&
            (message.message?.conversation || 
             message.message?.extendedTextMessage?.text)
        );
    }

    extractMessageText(message) {
        return message.message.conversation ||
               message.message.extendedTextMessage?.text ||
               '';
    }

    addToQueue(remoteJid, text) {
        this.messageQueue.push({
            remoteJid,
            text,
            timestamp: Date.now()
        });

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            while (this.messageQueue.length > 0) {
                const batch = this.messageQueue.splice(0, 5);
                await this.handleMessages(batch);
                await delay(1000 + Math.random() * 2000);
            }
        } catch (error) {
            logger.error('Queue processing failed:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    async handleMessages(messages) {
        const remoteJid = messages[0].remoteJid;
        const combinedText = messages.map(m => m.text).join('\n');
        await delay(1000 * Math.random() * 4000);
        
        const reply = await chatController.generateReply(combinedText);
        if (reply) {
            await this.sock.sendMessage(remoteJid, { text: reply });
        }
    }

    handleDisconnect(lastDisconnect) {
        const statusCode = lastDisconnect.error?.output?.statusCode;
        const shouldReconnect = statusCode !== 401 && statusCode !== 403;
        
        logger.warn(`Disconnected (Code ${statusCode || 'unknown'}). ${shouldReconnect ? 'Reconnecting...' : 'Permanent failure'}`);
        
        if (shouldReconnect) {
            setTimeout(() => {
                logger.info('Attempting reconnect...');
                this.initialize().catch(e => {
                    logger.error('Reconnect failed:', e);
                    this.handleDisconnect({ error: e });
                });
            }, 5000);
        } else {
            logger.error('Permanent auth failure. Delete auth_info folder and restart.');
        }
    }
}

if (!process.env.GIRLFRIEND_NUMBER) {
    throw new Error('GIRLFRIEND_NUMBER env variable not set!');
}

const sanitizedNumber = process.env.GIRLFRIEND_NUMBER.replace(/[^0-9]/g, '');
if (!sanitizedNumber.match(/^\d{10,15}$/)) {
    throw new Error('Invalid WhatsApp number format!');
}

module.exports = new WhatsappService();