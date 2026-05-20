import { webcrypto } from 'crypto';

declare const globalThis: { crypto?: unknown };

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as unknown;
}
