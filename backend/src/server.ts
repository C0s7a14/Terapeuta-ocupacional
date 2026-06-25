import { app } from "./app.js";
import { env } from "./config.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
  console.log(`API disponível em http://localhost:${env.PORT}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

