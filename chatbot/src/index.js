equire('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('./config/logger');
const whatsappService = require('./services/whatsappService');
const chatController = require('./controllers/chatController');

class Application {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
  }

  initialize() {
    this.setupMiddleware();
    this.setupRoutes();
    this.startServices();
    this.startServer();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  setupRoutes() {
    this.app.get('/logs', (req, res) => {
      res.json(chatController.getConversationHistory());
    });
  }

  startServices() {
    whatsappService.initialize().catch(error => {
      logger.error('Failed to initialize WhatsApp service:', error);
    });
  }

  startServer() {
    this.app.listen(this.port, () => {
      logger.info(`Server running on port ${this.port}`);
      console.log(`✅ Dashboard: http://localhost:${this.port}`);
    });
  }
}

// Start the application
new Application().initialize();