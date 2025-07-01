require('dotenv').config();
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
}