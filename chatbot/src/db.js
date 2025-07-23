const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    ProcessingInstruction.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});
