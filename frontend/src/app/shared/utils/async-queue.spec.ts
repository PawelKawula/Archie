import { AsyncQueue } from './async-queue';

describe('AsyncQueue', () => {
  let queue: AsyncQueue<string | null>;

  beforeEach(() => {
    queue = new AsyncQueue<string | null>(10);
  });

  it('should create an instance', () => {
    expect(queue).toBeTruthy();
  });

  it('should throw when maxsize is < 0', () => {
    expect(() => new AsyncQueue<number>(-1)).toThrow();
  });

  it('should throw when maxsize is not integer', () => {
    expect(() => new AsyncQueue<number>(1.5)).toThrow();
  });

  it('should put and get an item', async () => {
    await queue.enqueue('test');
    const result = await queue.dequeue();
    expect(result).toBe('test');
  });

  it('should maintain FIFO order', async () => {
    await queue.enqueue('first');
    await queue.enqueue('second');
    await queue.enqueue('third');

    expect(await queue.dequeue()).toBe('first');
    expect(await queue.dequeue()).toBe('second');
    expect(await queue.dequeue()).toBe('third');
  });

  it('should resolve get when an item is put into an empty queue', async () => {
    const getPromise = queue.dequeue();
    let resolved = false;
    getPromise.then(() => {
      resolved = true;
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(resolved).toBe(false);

    await queue.enqueue('item');
    const result = await getPromise;
    expect(result).toBe('item');
    expect(resolved).toBe(true);
  });

  it('should block put when the queue is full', async () => {
    const limitedQueue = new AsyncQueue<string>(2);
    await limitedQueue.enqueue('1');
    await limitedQueue.enqueue('2');
    expect(limitedQueue.full).toBe(true);

    let put3Resolved = false;
    const put3Promise = limitedQueue.enqueue('3').then(() => {
      put3Resolved = true;
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(put3Resolved).toBe(false);
    expect(limitedQueue.size).toBe(2);

    expect(await limitedQueue.dequeue()).toBe('1');

    await put3Promise;
    expect(put3Resolved).toBe(true);
    expect(limitedQueue.size).toBe(2);
    expect(await limitedQueue.dequeue()).toBe('2');
    expect(await limitedQueue.dequeue()).toBe('3');
  });

  it('should handle multiple waiting getters', async () => {
    const get1 = queue.dequeue();
    const get2 = queue.dequeue();

    await queue.enqueue('first');
    await queue.enqueue('second');

    expect(await get1).toBe('first');
    expect(await get2).toBe('second');
  });

  it('should correctly report size and full status', async () => {
    const limitedQueue = new AsyncQueue<string>(1);
    expect(limitedQueue.size).toBe(0);
    expect(limitedQueue.full).toBe(false);

    await limitedQueue.enqueue('item');
    expect(limitedQueue.size).toBe(1);
    expect(limitedQueue.full).toBe(true);

    const getPromise = limitedQueue.dequeue();
    expect(limitedQueue.size).toBe(0);
    expect(limitedQueue.full).toBe(false);
    await getPromise;
  });

  it('should handle null values correctly', async () => {
    const dequeuePromise = queue.dequeue();
    await queue.enqueue(null);

    const result = await dequeuePromise;
    expect(result).toBeNull();
  });
});
