const { OpenAI } = require("openai");
const logger = require("../config/logger");
const personalityService = require("./personalityService");
const chatHistoryService = require("./chatHistoryService");

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 15000,
    });
  }

  /**
   * Generate AI reply using profile + history context
   */
  async generateReply(profile, userMessage = null) {
    try {
      const config = await personalityService.getConfig(profile);

      const messages = [
        { role: "system", content: this.buildSystemPrompt(config) },
        ...config.conversationHistory,
      ];

      if (userMessage) {
        messages.push({ role: "user", content: userMessage });
        await chatHistoryService.addMessage(profile.id, "user", userMessage);
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.9,
        max_tokens: 150,
        frequency_penalty: 0.6,
        presence_penalty: 0.4,
      });

      const rawReply =
        response.choices[0]?.message?.content || "uhh i got nothin rn";

      await chatHistoryService.addMessage(profile.id, "assistant", rawReply);

      return this.casualizeText(rawReply, config.nicknames);
    } catch (error) {
      logger.error("OpenAI API error:", error);
      return "uhhh my brain stuck rn try again";
    }
  }

  buildSystemPrompt(config) {
    return `You are simulating ${config.userName}, the ${
      config.role
    } in a relationship. 
You are texting their partner and must reply exactly like them using their personality and style.

RULES:
1. Never say you're an AI
2. Write casually: lowercase, avoid proper punctuation
3. Insert occasional typos: e.g., 'u' for 'you', 'wat' for 'what'
4. Use their nicknames for their partner naturally in replies
5. Responses must be short and natural (1–2 lines max)

Personality:
- Gender: ${config.userGender || "unspecified"}
- Style: ${config.style}
- Tone: ${config.tone}
- Nicknames: ${config.nicknames.join(", ")}

Sample phrases (use as inspiration):
${config.sampleMsgs.join("\n")}

${
  config.memories && Object.keys(config.memories).length > 0
    ? `Memories:\n${Object.entries(config.memories)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")}`
    : ""
}`;
  }

  casualizeText(text, nicknames = []) {
    let casual = text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\\-_`~()?'"]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const replacements = {
      " you ": " u ",
      " your ": " ur ",
      " to ": " 2 ",
      " what ": " wat ",
      " with ": " wit ",
      " because ": " cuz ",
      " going to ": " gonna ",
      " them ": " dem ",
      " the ": " da ",
      " okay ": " k ",
      " though ": " tho ",
    };

    for (const [key, val] of Object.entries(replacements)) {
      if (Math.random() < 0.7) {
        casual = casual.replace(new RegExp(key, "g"), val);
      }
    }

    if (nicknames.length > 0 && Math.random() < 0.4) {
      const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
      casual = casual + " " + nickname;
    }

    if (Math.random() < 0.3) {
      casual = this.addRandomTypo(casual);
    }

    return casual;
  }

  /**
   * Add human-like typos randomly
   */
  addRandomTypo(text) {
    const words = text.split(" ");
    if (words.length < 2) return text;

    const index = Math.floor(Math.random() * words.length);
    let word = words[index];

    if (word.length < 3) return text;

    const typoType = Math.floor(Math.random() * 3);
    switch (typoType) {
      case 0: {
        const pos = Math.floor(Math.random() * (word.length - 1));
        word = word.slice(0, pos) + word[pos] + word.slice(pos);
        break;
      }
      case 1: {
        const removePos = Math.floor(Math.random() * word.length);
        word = word.slice(0, removePos) + word.slice(removePos + 1);
        break;
      }
      case 2:
        word = word.replace(
          /[aeiou]/g,
          () => "aeiou"[Math.floor(Math.random() * 5)]
        );
        break;
    }

    words[index] = word;
    return words.join(" ");
  }
}

module.exports = new OpenAIService();
