import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3333),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);

