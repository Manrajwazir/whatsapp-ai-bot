const prisma = require("../db");
const logger = require("../config/logger");

class UpdateHandler {
  async handleCommand(phone, commandText) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { partnerPhone: phone },
      });

      if (!profile) {
        return "❌ Complete onboarding first! Send any message to start setup.";
      }

      const args = commandText.split(" ");
      if (args.length < 3) {
        return this.showHelp();
      }

      const [_, type, key, ...valueParts] = args;
      const value = valueParts.join(" ");

      switch (type.toLowerCase()) {
        case "tone":
          return await this.updateTone(profile.id, value);
        case "style":
          return await this.updateStyle(profile.id, value);
        case "memory":
          return await this.updateMemory(profile.id, key, value);
        case "nickname":
          return await this.updateNicknames(profile.id, value);
        default:
          return this.showHelp();
      }
    } catch (error) {
      logger.error("Update command failed:", error);
      return "❌ Failed to update. Please try again.";
    }
  }

  async updateTone(profileId, tone) {
    await prisma.profile.update({
      where: { id: profileId },
      data: { tone },
    });
    return `✅ Tone updated to: "${tone}"`;
  }

  async updateStyle(profileId, style) {
    await prisma.profile.update({
      where: { id: profileId },
      data: { style },
    });
    return `✅ Style updated to: "${style}"`;
  }

  async updateMemory(profileId, key, value) {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    const memories = profile.memories || {};
    memories[key] = value;

    await prisma.profile.update({
      where: { id: profileId },
      data: { memories },
    });

    return `💾 Memory set: ${key} = "${value}"`;
  }

  async updateNicknames(profileId, nicknames) {
    await prisma.profile.update({
      where: { id: profileId },
      data: { nicknames: nicknames.split(",") },
    });
    return `✅ Nicknames updated!`;
  }

  showHelp() {
    return `📝 Usage: 
/update tone <value>
/update style <value> 
/update memory <key> <value>
/update nickname <comma,separated,list>`;
  }
}

module.exports = new UpdateHandler();
