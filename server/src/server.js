import app from "./app.js";
import env from "./config/env.js";
import prisma from "./config/db.js";

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

const shutdown = async () => {
  console.log("Graceful shutdown started...");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
