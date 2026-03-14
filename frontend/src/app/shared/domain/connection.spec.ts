import { Connection } from './connection';
import { Packet } from './packet';

describe('Connection', () => {
  let connection: Connection;

  beforeEach(() => {
    connection = new Connection({
      outQueueSize: 2,
      transitQueueSize: 2,
      arrivedQueueSize: 2,
    });
  });

  it('should be created', () => {
    expect(connection).toBeTruthy();
    expect(connection.outSize).toBe(0);
    expect(connection.transitSize).toBe(0);
    expect(connection.arrivedSize).toBe(0);
  });

  it('should enqueue a packet', async () => {
    const packet = new Packet({});
    await connection.enqueue(packet);
    expect(connection.outSize).toBe(1);
  });

  it('should move packet from out to transit on send', async () => {
    const packet = new Packet({});
    await connection.enqueue(packet);
    expect(connection.outSize).toBe(1);

    await connection.send();
    expect(connection.outSize).toBe(0);
    expect(connection.transitSize).toBe(1);
  });

  it('should move packet from transit to arrived on accept', async () => {
    const packet = new Packet({});
    await connection.enqueue(packet);
    await connection.send();
    expect(connection.transitSize).toBe(1);

    await connection.accept();
    expect(connection.transitSize).toBe(0);
    expect(connection.arrivedSize).toBe(1);
  });

  it('should dequeue packet from arrived on process', async () => {
    const packet = new Packet({});
    await connection.enqueue(packet);
    await connection.send();
    await connection.accept();
    expect(connection.arrivedSize).toBe(1);

    await connection.process();
    expect(connection.arrivedSize).toBe(0);
  });

  it('should do nothing on process if arrived queue is empty', async () => {
    expect(connection.arrivedSize).toBe(0);
    await connection.process();
    expect(connection.arrivedSize).toBe(0);
  });

  it('should handle flow of multiple packets', async () => {
    const packet1 = new Packet({ content: '1' });
    const packet2 = new Packet({ content: '2' });

    await connection.enqueue(packet1);
    await connection.enqueue(packet2);
    expect(connection.outSize).toBe(2);

    await connection.send();
    expect(connection.outSize).toBe(1);
    expect(connection.transitSize).toBe(1);

    await connection.send();
    expect(connection.outSize).toBe(0);
    expect(connection.transitSize).toBe(2);

    await connection.accept();
    expect(connection.transitSize).toBe(1);
    expect(connection.arrivedSize).toBe(1);

    await connection.accept();
    expect(connection.transitSize).toBe(0);
    expect(connection.arrivedSize).toBe(2);

    await connection.process();
    expect(connection.arrivedSize).toBe(1);

    await connection.process();
    expect(connection.arrivedSize).toBe(0);
  });
});
