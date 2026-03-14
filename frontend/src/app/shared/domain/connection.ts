import { AsyncQueue } from '../utils/async-queue';
import type { Packet } from './packet';

export type ConnectionOptions = {
  outQueueSize?: number;
  readonly transitQueueSize?: number;
  readonly arrivedQueueSize?: number;
};

export class Connection {
  private outQueue: AsyncQueue<Packet>;
  private transitQueue: AsyncQueue<Packet>;
  private arrivedQueue: AsyncQueue<Packet>;

  constructor(options?: ConnectionOptions) {
    this.outQueue = new AsyncQueue<Packet>(options?.outQueueSize ?? 100);
    this.transitQueue = new AsyncQueue<Packet>(
      options?.transitQueueSize ?? 100,
    );
    this.arrivedQueue = new AsyncQueue<Packet>(
      options?.arrivedQueueSize ?? 100,
    );
  }

  async enqueue(packet: Packet) {
    await this.outQueue.enqueue(packet);
  }

  async send() {
    this.transitQueue.enqueue(await this.outQueue.dequeue());
  }

  async accept() {
    this.arrivedQueue.enqueue(await this.transitQueue.dequeue());
  }

  async process() {
    if (this.arrivedQueue.size) await this.arrivedQueue.dequeue();
  }

  get outSize() {
    return this.outQueue.size;
  }

  get transitSize() {
    return this.transitQueue.size;
  }

  get arrivedSize() {
    return this.arrivedQueue.size;
  }
}
