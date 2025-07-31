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

  async getProfileByPhone(phone) {
    try {
      return await prisma.profile.findUnique({
        where: { partnerPhone: phone },
        include: {
          chatHistory: {
            take: 20,
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } catch (error) {
      logger.error("Failed to fetch profile by phone: ", error);
      return null;
    }
  }

  async isFirstRun() {
    try {
      const count = await prisma.profile.count();
      return count === 0;
    } catch (error) {
      logger.error("Failed to check first run:", error);
      throw error;
    }
  }

  async createProfile(profileData) {
    try {
      const data = {
        ...profileData,
        sampleMsgs: Array.isArray(profileData.sampleMsgs)
          ? profileData.sampleMsgs
          : [],
        nicknames: Array.isArray(profileData.nicknames)
          ? profileData.nicknames
          : [],
        memories: profileData.memories || {},
      };

      return await prisma.profile.create({
        data,
      });
    } catch (error) {
      logger.error("Failed to create profile: ", error);
      throw error;
    }
  }

  async updateProfile(updates) {
    try {
      const profile = await this.getProfile();
      if (!profile) throw new Error("No profile found to update");

      const data = {
        ...updates,
        sampleMsgs:
          updates.sampleMsgs !== undefined
            ? updates.sampleMsgs
            : profile.sampleMsgs,
        nicknames:
          updates.nicknames !== undefined
            ? updates.nicknames
            : profile.nicknames,
        memories:
          updates.memories !== undefined ? updates.memories : profile.memories,
      };

      return await prisma.profile.update({
        where: { id: profile.id },
        data,
      });
    } catch (error) {
      logger.error("Failed to update profile: ", error);
      throw error;
    }
  }
}

module.exports = new ProfileService();
