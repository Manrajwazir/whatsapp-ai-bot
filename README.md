# 🤖 WhatsApp AI Relationship Automated Reply System (Version 2) NEEDS UPDATE BECAUSE OF NEW GPT MODELS AND BAILEYS STUFF

Want a locally run program which replies to your significant other while you are busy coding? Well use this little local software then.

Welcome to **Version 2** of my AI-powered WhatsApp chatbot — a local tool that connects to WhatsApp via **Baileys**, responds using **OpenAI's GPT-3.5-turbo**, and now supports full Dockerization, persistent storage, enhanced customization, and more!

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

---

## 🧠 How It Works

1. Bot connects to WhatsApp Web (via QR code)
2. Messages are intercepted and sent to **OpenAI** with your custom personality
3. Replies are generated and sent back as if they're from _you_
4. Memories, chat history, and settings are stored in **PostgreSQL**

---

## 🚀 Quick Start (Docker Recommended)

> ⚙️ **Prerequisites**: Docker Desktop installed + your [OpenAI API key](https://platform.openai.com/)
> KEEP YOUR WHATSAPP OPEN ON YOUR LAPTOP.

---

### 1. Fork & Clone This Repo

```bash
git clone https://github.com/Manrajwazir/whatsapp-ai-bot.git
cd whatsapp-ai-bot/chatbot
```

---

### 2. Create Your `.env` File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and replace:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

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
docker-compose build
```

Then

```bash
docker compose up
```

Let it finish and **exit using `CTRL+C`** (we do this once to set up the DB).

---

### 6. Start the Bot (with interactive terminal)

Run the following **every time** to launch the bot:

```bash
docker-compose run --rm --service-ports bot
```

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
```

## Or you could use the reset personality option in the dashboard at localhost:3000

## 🧩 Project Structure

```
chatbot/
├── auth_info/
├── logs/
├── node_modules/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
│   └── index.html
├── src/
│   ├── config/
│   │   └── logger.js
│   ├── controllers/
│   │   ├── chatController.js
│   │   └── profileController.js
│   ├── services/
│   │   ├── chatHistoryService.js
│   │   ├── consoleOnboarder.js
│   │   ├── onboardingHandler.js
│   │   ├── openaiService.js
│   │   ├── personalityService.js
│   │   ├── profileService.js
│   │   ├── updateHandler.js
│   │   └── whatsappService.js
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
- Add functionality with other apps as well such as intagram or discord

---

## 📄 License

MIT

---

## 🙋‍♂️ Author

**Manraj Wazir**  
Student @ NAIT | Backend Developer | Aspiring GPU Engineer 
[🔗 GitHub](https://github.com/Manrajwazir/whatsapp-ai-bot) | [🔗 LinkedIn](https://www.linkedin.com/in/manraj-wazir/)

---

## 🆘 Need Help?

Feel free to open an issue or contact me via LinkedIn or GitHub.
