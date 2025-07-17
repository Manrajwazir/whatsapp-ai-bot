# 🤖 WhatsApp AI Chatbot (Version 1)

Welcome to **Version 1** of my custom-built **WhatsApp AI Chatbot** — a local tool that connects to WhatsApp using the **Baileys** library and generates intelligent replies using **OpenAI's API**.

---

## 📌 Features

✅ **Real-time message handling** via WhatsApp Web  
✅ **Custom personality** logic built into responses  
✅ **In-memory user profile storage** using JSON  
✅ **Live monitoring dashboard** at `localhost:3000`  
✅ **Structured logging** using Winston (error + chat logs)  
✅ **Developer-focused** — made to be hacked and expanded!

---

## 🧠 How It Works

1. **Baileys** connects the bot to WhatsApp locally (QR scan required).
2. **Incoming messages** are intercepted and passed to the AI.
3. **OpenAI API** generates replies *based on your defined personality traits*.
4. Replies are **sent back to WhatsApp** with natural tone and behavior.
5. All interactions and logs are saved locally in the `/logs` folder.

---

## 🛠️ Tech Stack

| Layer             | Tech Used              |
|------------------|------------------------|
| Messaging Client | [Baileys](https://github.com/WhiskeySockets/Baileys) |
| Backend          | Node.js + Express      |
| AI Brain         | OpenAI GPT-3-5 Turbo (API)     |
| Logging          | Winston                |
| Dashboard        | Basic HTML + Tailwind  |

---

## 🚀 Getting Started

> This bot runs locally — **not hosted**, and requires your WhatsApp to stay active on your device.

### 1. Clone the Repo

```bash
git clone https://github.com/Manrajwazir/whatsapp-ai-bot.git
cd whatsapp-ai-bot
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Create Your .env File
```bash
OPENAI_API_KEY=your_openai_key_here
PORT=3000
```
### 4. Start the Bot
```bash
npm run dev
```
### 5. Scan the QR Code
Open WhatsApp on your phone
Link a new device using the QR code shown in your terminal

### 🧩 Project Structure
```bash
chatbot/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── logs/
│   ├── combined.log
│   └── error.log
├── public/                 # Dashboard UI
├── src/
│   ├── index.js            # Entry point for the app
│   ├── config/
│   │   └── logger.js       # Winston configuration
│   ├── controllers/
│   │   └── chatController.js
│   ├── services/
│   │   ├── openaiService.js
│   │   └── whatsappService.js
```
💬 Example Response Logic
```bash
Message: "How are you today?"

Profile: { nickname: "cutie", tone: "clingy", mood: "jealous" }

Result: "Ughhh why didn’t you message me earlier? 😒 I missed youuuu cutie 😩❤️"
```

### 🚧 Limitations (v1)

No persistent database — all user data is stored in-memory
Only supports one user/bot personality
Not hosted online (requires manual startup and WhatsApp login)

### 🗺️ Roadmap
Version 2 (Coming Soon!):

PostgreSQL + Prisma DB for persistent user profiles

Onboarding flow for dynamic bot setup

Real-time command updates via WhatsApp or terminal

Docker support

Multiple personality presets

💡 Version 2 will be published in the same GitHub repo.

## License

This project is licensed under the [MIT License](LICENSE).

🙋‍♂️ Author
Manraj Wazir
Student @ NAIT | Backend Developer | Aspiring Cybersecurity Engineer
- 🔗 [GitHub Repository](https://github.com/Manrajwazir/whatsapp-ai-bot)
- 👤 [Connect with me on LinkedIn](https://www.linkedin.com/in/manraj-wazir/)





