const prisma = require("../db");
const logger = require("../config/logger");

class ProfileController {
  async getProfile() {
    try {
      return await prisma.profile.findFirst({
        include: {
          chatHistory: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });
    } catch (error) {
      logger.error("Failed to fetch profile:", error);
      return null;
    }
  }

  async updateProfile(updates) {
    try {
      const profile = await this.getProfile();
      if (!profile) throw new Error("No profile found to update");

      return await prisma.profile.update({
        where: { id: profile.id },
        data: updates,
      });
    } catch (error) {
      logger.error("Failed to update profile:", error);
      throw error;
    }
  }
}

module.exports = new ProfileController();
