import { assert } from '../../core/utils';

// biome-ignore lint/complexity/noBannedTypes: just make sure it's not undefined
export class AsyncQueue<T extends {} | null> {
  private readonly items: T[] = [];
  private readonly maxsize: number;

  private getters: ((value: T) => void)[] = [];

  private putters: (() => void)[] = [];

  constructor(maxsize: number) {
    this.maxsize = maxsize;
    assert(
      this.maxsize > 0 && Number.isInteger(maxsize),
      'Queue must have max size > 0 and size must be integer',
    );
  }

  async enqueue(item: T): Promise<void> {
    const resolve = this.getters.shift();

    if (resolve) {
      resolve(item);
      return;
    }

    if (this.items.length >= this.maxsize) {
      await new Promise<void>((resolve) => {
        this.putters.push(resolve);
      });
    }

    this.items.push(item);
  }

  async dequeue(): Promise<T> {
    const item = this.items.shift();

    if (item) {
      const resolve = this.putters.shift();
      if (resolve) {
        resolve();
      }
      return item;
    }

    return new Promise<T>((resolve) => {
      this.getters.push(resolve);
    });
  }

  get size(): number {
    return this.items.length;
  }

  get full(): boolean {
    return this.maxsize > 0 && this.items.length >= this.maxsize;
  }

  toSnapshot(): { items: readonly T[]; maxsize: number } {
    return { items: [...this.items], maxsize: this.maxsize };
  }
}
