# 🤖 WhatsApp AI Chatbot (Version 2)

# 🤖 WhatsApp AI Chatbot (Version 2)

Welcome to **Version 2** of my AI-powered WhatsApp chatbot — a local tool that connects to WhatsApp via **Baileys**, responds using **OpenAI's GPT-4-turbo**, and now supports full Dockerization, persistent storage, enhanced customization, and more!
Welcome to **Version 2** of my AI-powered WhatsApp chatbot — a local tool that connects to WhatsApp via **Baileys**, responds using **OpenAI's GPT-4-turbo**, and now supports full Dockerization, persistent storage, enhanced customization, and more!

---

## ✨ What's New in Version 2

✅ **First-time onboarding** flow (guided setup in terminal)  
✅ **PostgreSQL + Prisma** for persistent storage  
✅ **Fully Dockerized**: no need to install Node or PostgreSQL manually  
✅ **Customizable personality** (tone, style, nicknames, memories)  
✅ **Dynamic roles**: Choose if bot acts as _boyfriend_ or _girlfriend_  
✅ **Enhanced dashboard** with:

- Visual memory editor
- Personality preset manager
- Reply length chart

✅ **Default personality modes**  
✅ **Real-time updates** via WhatsApp commands (e.g. `/update tone clingy`)  
✅ **Auto-reconnect + session saving**

## ✨ What's New in Version 2

✅ **First-time onboarding** flow (guided setup in terminal)  
✅ **PostgreSQL + Prisma** for persistent storage  
✅ **Fully Dockerized**: no need to install Node or PostgreSQL manually  
✅ **Customizable personality** (tone, style, nicknames, memories)  
✅ **Dynamic roles**: Choose if bot acts as _boyfriend_ or _girlfriend_  
✅ **Enhanced dashboard** with:

- Visual memory editor
- Personality preset manager
- Reply length chart

✅ **Default personality modes**  
✅ **Real-time updates** via WhatsApp commands (e.g. `/update tone clingy`)  
✅ **Auto-reconnect + session saving**

---

## 🧠 How It Works

1. **Baileys** connects the bot to WhatsApp locally (QR scan required).
2. **Incoming messages** are intercepted and passed to the AI.
3. **OpenAI API** generates replies _based on your defined personality traits_.
4. Replies are **sent back to WhatsApp** with natural tone and behavior.
5. All interactions and logs are saved locally in the `/logs` folder.
6. Bot connects to WhatsApp Web (via QR code)
7. Messages are intercepted and sent to **OpenAI** with your custom personality
8. Replies are generated and sent back as if they're from _you_
9. Memories, chat history, and settings are stored in **PostgreSQL**

---

## 🛠️ Tech Stack

| Layer            | Tech Used                                            |
| ---------------- | ---------------------------------------------------- |
| Messaging Client | [Baileys](https://github.com/WhiskeySockets/Baileys) |
| Backend          | Node.js + Express                                    |
| AI Brain         | OpenAI GPT-3-5 Turbo (API)                           |
| Logging          | Winston                                              |
| Dashboard        | Basic HTML + Tailwind                                |

---

## 🚀 Getting Started

> This bot runs locally — **not hosted**, and requires your WhatsApp to stay active on your device.

### 1. Clone the Repo

## 🚀 Quick Start (Docker Recommended)

> ⚙️ **Prerequisites**: Docker Desktop installed + your [OpenAI API key](https://platform.openai.com/)

---

### 1. Fork & Clone This Repo

```bash
git clone https://github.com/Manrajwazir/whatsapp-ai-bot.git
cd whatsapp-ai-bot
```

### 2. Install Dependencies

---

### 2. Create Your `.env` File

Copy `.env.example` to `.env`:

```bash
npm install
```

### 3. Create Your .env File

cp .env.example .env

````

Then edit `.env` and replace:

```env
OPENAI_API_KEY=your_openai_api_key_here
````

---

### 3. Insert OpenAI Key into Docker Compose

In `docker-compose.yml`, replace:

```yml
OPENAI_API_KEY: your_openai_api_key_here
```

With your actual key (same one you put in `.env`).

---

### 4. Fix `entrypoint.sh` Line Endings (IMPORTANT ⚠️)

In VS Code:

- Bottom-right, click where it says `CRLF`
- Change it to `LF`

This ensures Docker can execute the shell script properly on Unix-based systems.

---

### 5. Build the Docker Image

```bash
OPENAI_API_KEY=your_openai_key_here
PORT=3000
```

### 4. Start the Bot

docker-compose up --build

````

Let it finish and **exit using `CTRL+C`** (we do this once to set up the DB).

---

### 6. Start the Bot (with interactive terminal)

Run the following **every time** to launch the bot:

```bash
npm run dev
````

### 5. Scan the QR Code

Open WhatsApp on your phone
Link a new device using the QR code shown in your terminal

### 🧩 Project Structure

docker-compose run --rm --service-ports bot

````

This ensures:

- WhatsApp onboarding works
- You can type `/update` commands
- Console stays interactive

---

## 🔁 Re-Onboarding

If the bot detects no user profile (fresh DB), it will guide you with:

- Your role (bf/gf)
- Your name, gender
- Partner’s number
- Message style, tone, and examples
- Nicknames

To restart onboarding manually, delete the DB volume or run:

```bash
docker volume rm chatbot_postgres_data
````

---

## 🧩 Project Structure

```
chatbot/
├── auth_info/
├── auth_info/
├── logs/
├── node_modules/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
│   └── index.html
├── node_modules/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
│   └── index.html
├── src/
│   ├── config/
│   │   └── logger.js
│   │   └── logger.js
│   ├── controllers/
│   │   ├── chatController.js
│   │   └── profileController.js
│   │   ├── chatController.js
│   │   └── profileController.js
│   ├── services/
│   │   ├── chatHistoryService.js
│   │   ├── consoleOnboarder.js
│   │   ├── onboardingHandler.js
│   │   ├── chatHistoryService.js
│   │   ├── consoleOnboarder.js
│   │   ├── onboardingHandler.js
│   │   ├── openaiService.js
│   │   ├── personalityService.js
│   │   ├── profileService.js
│   │   ├── updateHandler.js
│   │   ├── personalityService.js
│   │   ├── profileService.js
│   │   ├── updateHandler.js
│   │   └── whatsappService.js
```

💬 Example Response Logic

```bash
Message: "How are you today?"

Profile: { nickname: "cutie", tone: "clingy", mood: "jealous" }

Result: "Ughhh why didn’t you message me earlier? 😒 I missed youuuu cutie 😩❤️"
│   ├── db.js
│   └── index.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── LICENSE
└── README.md
```

---

## 🧠 Example Reply Logic

```
Input: "what u doing rn"
Tone: playful, jealous
Nicknames: pichu

Result: "hmm wouldn’t *you* like to know, pichu 😏"
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

---

## 🧪 Commands

- `/update tone playful yet sarcastic`
- `/update style flirty`
- `/update nicknames babe, hun, muffin`
- `/reset` → clears current personality

---

## 📊 Dashboard

Visit: [http://localhost:3000](http://localhost:3000)

- View/edit memories
- Monitor chat length and logs
- Change preset personality settings

---

## ❗ Common Issues

| Problem                    | Fix                                     |
| -------------------------- | --------------------------------------- |
| `entrypoint.sh: not found` | Change CRLF to LF                       |
| `.env not working`         | Make sure it exists & Docker has access |
| Not interactive terminal   | Always run with `--service-ports`       |

---

## 🗺️ Roadmap (Post-V2)

- Multi-user support
- Session selector
- OTP login + hosting
- AI mood tracker
- WhatsApp command interface (buttons/reactions)

---

## 📄 License

MIT

---

## 🙋‍♂️ Author

**Manraj Wazir**  
Student @ NAIT | Backend Developer | Aspiring Cybersecurity Engineer  
[🔗 GitHub](https://github.com/Manrajwazir/whatsapp-ai-bot) | [🔗 LinkedIn](https://www.linkedin.com/in/manraj-wazir/)

---

## 🆘 Need Help?

Feel free to open an issue or contact me via LinkedIn or GitHub.
