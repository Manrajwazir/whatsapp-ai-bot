const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function connectWhatsApp(onMessage, girlfriendNumber) {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ auth: state });

  sock.ev.on("messages.upsert", async (m) => {
    const message = m.messages?.[0];
    if (!message?.message?.conversation) return;

    const from = message.key.remoteJid;
    const text = message.message.conversation;

    if (from === girlfriendNumber) {
      const reply = await onMessage(text);
      await sock.sendMessage(from, { text: reply }); 
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock; // return the socket here
}

module.exports = connectWhatsApp;