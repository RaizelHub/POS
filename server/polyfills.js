import { Buffer } from 'buffer';

// Node 26 removed SlowBuffer, but some older dependencies still reference it.
// This shim makes those modules compatible by redirecting SlowBuffer to Buffer.
if (!Buffer.SlowBuffer) {
  Buffer.SlowBuffer = Buffer;
}

if (typeof globalThis.SlowBuffer === 'undefined') {
  globalThis.SlowBuffer = Buffer;
}
