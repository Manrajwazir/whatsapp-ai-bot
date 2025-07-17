const { makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys')
const logger = require('../config/logger')
const chatController = require('../controllers/chatController')
const qrcode = require('qrcode-terminal')

class WhatsAppService {
  constructor () {
    this.messageQueue = []
    this.isProcessing = false
    this.sock = null
  }

  async initialize () {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('./auth_info')

      this.sock = makeWASocket({
        auth: state,
        logger
      })

      this.setupEventHandlers(saveCreds)
      logger.info('WhatsApp service initialized')
    } catch (error) {
      logger.error('WhatsApp initialization failed:', error)
      throw error
    }
  }

  setupEventHandlers (saveCreds) {
    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        qrcode.generate(qr, { small: true })
        logger.info('Scan the QR code above to log in.')
      }

      if (connection === 'close') {
        this.handleDisconnect(lastDisconnect)
      }
    })

    this.sock.ev.on('creds.update', saveCreds)

    this.sock.ev.on('messages.upsert', async (m) => {
      try {
        const message = m.messages[0]
        if (!this.shouldProcessMessage(message)) return

        const text = this.extractMessageText(message)
        if (!text) return

        this.addToQueue(message.key.remoteJid, text)
      } catch (error) {
        logger.error('Message processing error:', error)
      }
    })
  }

  shouldProcessMessage (message) {
    // Don't process if no message or if it's from yourself
    return message?.message &&
           !message.key.fromMe &&
           message.key.remoteJid === process.env.GIRLFRIEND_NUMBER
  }

  extractMessageText (message) {
    return message.message.conversation ||
           message.message.extendedTextMessage?.text ||
           ''
  }

  addToQueue (remoteJid, text) {
    this.messageQueue.push({
      remoteJid,
      text,
      timestamp: Date.now()
    })

    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  async processQueue () {
    this.isProcessing = true

    try {
      await delay(3000) // Wait for potential message grouping

      if (this.messageQueue.length === 0) {
        this.isProcessing = false
        return
      }

      const now = Date.now()
      const recentMessages = this.messageQueue.filter(m => now - m.timestamp < 5000)
      this.messageQueue = this.messageQueue.filter(m => now - m.timestamp >= 5000)

      if (recentMessages.length > 0) {
        await this.handleMessages(recentMessages)
      }
    } catch (error) {
      logger.error('Queue processing error:', error)
    } finally {
      this.isProcessing = false

      if (this.messageQueue.length > 0) {
        this.processQueue()
      }
    }
  }

  async handleMessages (messages) {
    const remoteJid = messages[0].remoteJid
    const combinedText = messages.map(m => m.text).join('\n')

    // Human-like delay (1-5 seconds)
    await delay(1000 + Math.random() * 4000)

    const reply = await chatController.generateReply(combinedText)
    chatController.addToHistory('user', combinedText)
    chatController.addToHistory('assistant', reply)

    if (reply) {
      await this.sock.sendMessage(remoteJid, { text: reply })
    }
  }

  handleDisconnect (lastDisconnect) {
    const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== 401
    logger.warn(`Connection closed. Reconnecting: ${shouldReconnect}`)

    if (shouldReconnect) {
      setTimeout(() => this.initialize(), 5000)
    }
  }
}

module.exports = new WhatsAppService()
