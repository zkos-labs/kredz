import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MIDNIGHT_INDEXER_URL: z.string().url().default('http://localhost:9944/graphql'),
  MIDNIGHT_NODE_URI: z.string().url().default('http://localhost:9944'),
  BASE_RPC_URL: z.string().url().default('https://sepolia.base.org'),
  SCORING_ENGINE_KEY: z.string(),
  SCORING_ENGINE_PUBKEY: z.string(),
  SUMSUB_API_URL: z.string().url().optional(),
  SUMSUB_APP_TOKEN: z.string().optional(),
  SUMSUB_SECRET_KEY: z.string().optional(),
  BLOCKFROST_API_KEY: z.string().optional(),
  API_KEY_HASH: z.string(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  CANTON_LEDGER_API_URL: z.string().url().optional(),
  CANTON_JSON_API_URL: z.string().url().optional(),
});

export const config = envSchema.parse(process.env);
