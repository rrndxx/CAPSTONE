import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string(),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string(),
    OPNSENSE_URL: z.string(),
    OPNSENSE_KEY: z.string(),
    OPNSENSE_SECRET: z.string(),
    PYTHON_SCANNER_URL: z.string(),
    ADGUARD_URL: z.string(),
    ADGUARD_USERNAME: z.string(),
    ADGUARD_PASSWORD: z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.log("Wrong env variables", parsed.error.format())
    process.exit(1)
}

export const config = parsed.data;