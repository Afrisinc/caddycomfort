import type { Redis } from 'ioredis';
import { MemoryStore, type IncrementResponse, type Options, type Store } from 'express-rate-limit';

export class RedisRateLimitStore implements Store {
  readonly localKeys = false;
  private readonly fallback = new MemoryStore();
  private windowMs = 0;

  constructor(
    private readonly client: Redis,
    readonly prefix: string,
  ) {}

  private get available(): boolean {
    return this.client.status === 'ready';
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
    this.fallback.init(options);
  }

  async increment(key: string): Promise<IncrementResponse> {
    if (!this.available) return this.fallback.increment(key);

    const id = this.prefix + key;
    const results = await this.client
      .multi()
      .incr(id)
      .pexpire(id, this.windowMs, 'NX')
      .pttl(id)
      .exec();

    if (!results) throw new Error('Rate limit transaction aborted');

    const failed = results.find(([error]) => error);
    if (failed) throw failed[0];

    const totalHits = results[0][1] as number;
    const ttl = results[2][1] as number;

    return { totalHits, resetTime: new Date(Date.now() + Math.max(ttl, 0)) };
  }

  async decrement(key: string): Promise<void> {
    if (!this.available) return this.fallback.decrement(key);

    const id = this.prefix + key;
    await this.client.multi().decr(id).pexpire(id, this.windowMs, 'NX').exec();
  }

  async resetKey(key: string): Promise<void> {
    this.fallback.resetKey(key);
    if (this.available) await this.client.del(this.prefix + key);
  }

  shutdown(): void {
    this.fallback.shutdown();
  }
}
