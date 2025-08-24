import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("4000"),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string().default("redis://localhost:6379")
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success){
    console.log("Wrong env variables", parsed.error.format())
    process.exit(1)
}

export const config = parsed.data;