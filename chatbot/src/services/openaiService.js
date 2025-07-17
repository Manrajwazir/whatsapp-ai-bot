const { OpenAI } = require('openai')
const logger = require('../config/logger')

class OpenAIService {
  constructor () {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 15000 // 15 second timeout
    })

    this.personality = {
      name: 'Manraj Wazir',
      traits: [
        'Texts like a real person',
        'Casual but caring',
        'Brief responses but not cold',
        'Occasional humor',
        'Shows interest but not overly eager',
        'No perfect punctuation',
        'Occasional typos',
        'Brief and casual',
        'Never uses periods or commas',
        'Uses hinglish words in sentences sometimes'
      ],
      examples: [
        {
          input: 'Hey, how was your day?',
          output: 'badhia got some work done u?'
        },
        {
          input: 'i miss u',
          output: 'miss u too bbg muah'
        },
        {
          input: 'What are you doing?',
          output: 'chillin wat bout u'
        }
      ]
    }
  }

  async generateReply (conversation) {
    try {
      const messages = this.buildMessageList(conversation)

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Respond briefly and concisely. Keep answers in the range between 40 - 130 words depending on the conversation.' },
          ...messages
        ],
        temperature: 0.9,
        max_tokens: 150,
        frequency_penalty: 0.6,
        presence_penalty: 0.4
      })

      const rawReply = response.choices[0]?.message?.content || 'hmm not sure wat to say'
      return this.casualizeText(rawReply)
    } catch (error) {
      logger.error('OpenAI API error: ', error)
      return 'my brains cannot understand this tell me sumthin else'
    }
  }

  buildMessageList (conversation) {
    const systemPrompt = {
      role: 'system',
      content: `you are ${this.personality.name} texting your girlfriend who lives in india and you live in edmonton. Follow these rules:
      1. Never use punctuation (. , ! ?)
      2. Use lowercase unless it's a name
      3. Make occasional typos (u instead of you, wat instead of what)
      4. Keep responses brief (1-2 lines max)
      5. Never reveal you're an AI
      
      Personality traits: ${this.personality.traits.join(', ')}`
    }

    const exampleMessages = this.personality.examples.flatMap(ex => [
      { role: 'user', content: ex.input },
      { role: 'assistant', content: ex.output }
    ])

    return [systemPrompt, ...exampleMessages, ...conversation]
  }

  casualizeText (text) {
    let casual = text.toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

    const replacements = {
      ' you ': ' u ',
      ' your ': ' ur ',
      ' to ': ' 2 ',
      ' what ': ' wat ',
      ' with ': ' wit ',
      ' because ': ' cuz ',
      ' going to ': ' gonna ',
      ' them ': ' dem ',
      ' the ': ' da ',
      ' okay ': ' k ',
      ' though ': ' tho '
    }

    Object.entries(replacements).forEach(([proper, casualVersion]) => {
      if (Math.random() < 0.7) {
        casual = casual.replace(new RegExp(proper, 'g'), casualVersion)
      }
    })

    if (Math.random() < 0.3) {
      casual = this.addRandomTypo(casual)
    }

    return casual
  }

  addRandomTypo (text) {
    const words = text.split(' ')
    if (words.length < 2) return text

    const typoPos = Math.floor(Math.random() * words.length)
    const word = words[typoPos]

    if (word.length <= 2) return text

    // Apply different typo types
    const typoType = Math.floor(Math.random() * 3)
    switch (typoType) {
      case 0: {
        const doublePos = Math.floor(Math.random() * (word.length - 1))
        words[typoPos] = word.slice(0, doublePos + 1) + word.slice(doublePos)
        break
      }
      case 1: {
        const removePos = Math.floor(Math.random() * word.length)
        words[typoPos] = word.slice(0, removePos) + word.slice(removePos + 1)
        break
      }
      case 2:
        words[typoPos] = word.replace(/[aeiou]/g, () =>
          'aeiou'[Math.floor(Math.random() * 5)])
        break
    }
    return words.join(' ')
  }
}

module.exports = new OpenAIService()
