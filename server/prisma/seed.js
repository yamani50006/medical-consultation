import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME || "System Admin";
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

  if (!adminEmail || !adminPassword) {
    console.log("Skipping admin seed: ADMIN_EMAIL or ADMIN_PASSWORD missing.");
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existing) {
    console.log("Admin already exists.");
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, saltRounds);

  await prisma.user.create({
    data: {
      fullName: adminFullName,
      email: adminEmail,
      password: hashed,
      role: "ADMIN",
      status: "ACTIVE"
    }
  });

  console.log("Admin seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
