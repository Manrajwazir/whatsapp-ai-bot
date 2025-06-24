const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); 

async function getReply(conversation) {
  const systemPrompt = {
    role: "system",
    content:
      "Act like Manraj Wazir. You're talking to your girlfriend. Be natural kinda non chalant but also sometimes show u care but bont use too many words that will give u away so be nice gentle but not ovverly lovely  Never mention you're an AI. Maintain context."
  };
  
  const reply = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [systemPrompt, ...conversation]
  });
  
  return reply.choices[0]?.message?.content ?? "I am offline.";
}

module.exports = { getReply };
