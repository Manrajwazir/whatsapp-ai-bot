const { OpenAI } = require("openai");
const logger = require('../config/logger');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 15000 // 15 second timeout
    });

    this.personality = {
      name: "Manraj Wazir",
      traits: [
        "Texts like a real person",
        "Casual but caring",
        "Brief responses but not cold",
        "Occasional humor",
        "Shows interest but not overly eager",
        "No perfect punctuation",
        "Occasional typos",
        "Brief and casual",
        "Never uses periods or commas",
        "Replies in hinglish for casualty"
      ],
      examples: [
        {
          input: "Hey, how was your day?",
          output: "badhia got some work done u?"
        },
        {
          input: "i miss u",
          output: "miss u too bbg muah"
        },
        {
          input: "What are you doing?",
          output: "chillin wat bout u"
        }
      ]
    };
  }
  async generateReply(conversation) {
    try {
      const messages = this.buildMessageList(conversation);

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.85,
        max_tokens: 150,
        frequency_penalty: 0.7,
        presence_penalty: 0.4
      });

      const rawReply = response.choices[0]?.message?.content || "hmm not sure wat to say";
      return this.casualizeText(rawReply);
    }catch(error){
      logger.error('OpenAI API error: ', error);
      return "my brains cannot understand this tell me sumthin else";
    }
  }

  buildMessageList(conversation) {
    const systemPrompt = {
      role: "system",
      content: `you are ${this.personality.name} texting your girlfriend who lives in india and you live in edmonton. Follow these rules:
      1. Never use punctuation (. , ! ?)
      2. Use lowercase unless it's a name
      3. Make occasional typos (u instead of you, wat instead of what)
      4. Keep responses brief (1-2 lines max)
      5. Never reveal you're an AI
      
      Personality traits: ${this.personality.traits.join(', ')}`
    };

    const exampleMessages = this.personality.examples.flatMap(ex => [
      { role: "user", content: ex.input },
      { role: "assistant", content: ex.output }
    ]);

    return [systemPrompt, ...exampleMessages, ...conversation];
  }

  casualizeText(text) {
    let casual = text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

      const replacements = {
      ' you ': ' u ',
      ' your ': ' ur ',
      ' are ': ' r ',
      ' to ': ' 2 ',
      ' too ': ' 2 ',
      ' for ': ' 4 ',
      ' what ': ' wat ',
      ' with ': ' wit ',
      ' because ': ' cuz ',
      ' going to ': ' gonna ',
      ' them ': ' dem ',
      ' the ': ' da ',
      ' okay ': ' k ',
      ' though ': ' tho '
      };

      Object.entries(replacements).forEach(([proper, casualVersion]) => {
      if (Math.random() < 0.7) {
        casual = casual.replace(new RegExp(proper, 'g'), casualVersion);
      }
    });

    if (Math.random() < 0.3) {
      casual = this.addRandomTypo(casual);
    }

    return casual;
  }
}

module.exports = new OpenAIService();
