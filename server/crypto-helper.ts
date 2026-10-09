import * as nodeCrypto from 'crypto';

export const crypto = {
  randomToken(): string {
    return nodeCrypto.randomBytes(32).toString('hex');
  },
  hash(input: string): string {
    return nodeCrypto.createHash('sha256').update(input).digest('hex');
  }
};
