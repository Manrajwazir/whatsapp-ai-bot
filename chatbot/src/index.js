const connectWhatsApp = require('./whatsapp');
const { getReply } = require('./openai');
const express = require('express');
const path = require('path');
require('dotenv').config();
const qrcode = require('qrcode-terminal'); // add this for terminal QR code

// Chat messages (in-memory for context)
let messages = []; 

async function main() {
  const girlfriendNumber = process.env.GIRLFRIEND_NUMBER;

  // This callback will handle incoming messages & generate replies
  const onMessage = async (userMessage) => {
    messages.push({ role: "user", content: userMessage }); 
    const reply = await getReply(messages);
    messages.push({ role: "assistant", content: reply }); 

    // Keep only the last 20 messages
    if (messages.length > 20) {
      messages = messages.slice(-20);
    }

    return reply;
  };

  // Connect WhatsApp and get the socket instance
  const sock = await connectWhatsApp(onMessage, girlfriendNumber);

  // Listen for connection updates to show QR or handle disconnects
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Scan this QR code with your phone:");
      qrcode.generate(qr, { small: true });  // terminal QR code
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== 401;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        main(); // restart connection
      }
    }

    if (connection === 'open') {
      console.log('WhatsApp connection opened');
    }
  });

  // ✅ Dashboard
  const app = express();
  app.use(express.static(path.join(__dirname, "../public")));
  app.get("/logs", (req, res) => res.json(messages));
  app.listen(3000, () => {
    console.log("✅ Dashboard running at http://localhost:3000");
  });
}

main();