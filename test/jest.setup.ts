import { config as loadEnv } from 'dotenv';
import { webcrypto } from 'crypto';

loadEnv({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

declare const globalThis: { crypto?: unknown };

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as unknown;
}
