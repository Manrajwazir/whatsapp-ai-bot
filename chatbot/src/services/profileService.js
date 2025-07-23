const prisma = require("../db");
const logger = require("../config/logger");

class ProfileService {
  async getProfile() {
    try {
      return await prisma.profile.findFirst();
    } catch (error) {
      logger.error("Failed to fetch profile: ", error);
      return null;
    }
  }

  async getProfileByphone(phone) {
    try {
      return await prisma.profile.findUnique({
        where: { partnerPhone: phone },
        include: { chatHistory: { take: 20, orderBy: { timestamp: "desc" } } },
      });
    } catch (error) {
      logger.error("Failed to fetch profile by phone: ", error);
      return null;
    }
  }

  async isFirstRun() {
    try {
      const count = prisma.profile.count();
      return count === 0;
    } catch (error) {
      logger.error("Failed to check first run:", error);
      return true;
    }
  }

  async createProfile(profileData) {
    try {
      return await prisma.profile.create({
        data: profileData,
      });
    } catch (error) {
      logger.error("Failed to create profile: ", error);
      throw error;
    }
  }

  async updateProfile(updates) {
    try {
      const profile = await this.getProfile();
      if (!profile) throw new Error("No profile found");

      return await prisma.profile.update({
        where: { id: profile.id },
        data: updates,
      });
    } catch (error) {
      logger.error("Failed to update profile: ", error);
      throw error;
    }
  }
}

module.exports = new ProfileService();
