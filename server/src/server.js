import { createServer } from "http";
import app from "./app.js";
import env from "./config/env.js";
import prisma from "./config/db.js";
import { initializeSocketServer } from "./infrastructure/socket/socketServer.js";

const httpServer = createServer(app);

await initializeSocketServer(httpServer);

const server = httpServer.listen(env.port, () => {
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
