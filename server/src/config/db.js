import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
process.env.PRISMA_CLIENT_ENGINE_TYPE ||= "binary";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
