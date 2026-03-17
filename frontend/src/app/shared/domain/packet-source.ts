import type { Connector } from './connector';
import { Node, type NodeOptions } from './node';
import { Packet } from './packet';
import type { PacketSourceSnapshot } from './snapshot';

export type PacketSourceOptions = {
  connector: Connector;
  interval?: number;
};

type _PacketSourceOptions = NodeOptions & PacketSourceOptions;

export class PacketSource extends Node {
  connector: Connector;
  interval: number;
  private tickCount = 0;

  constructor(options: _PacketSourceOptions) {
    super(options);
    this.type = 'source';
    this.connector = options.connector;
    this.interval = options.interval ?? 1;
  }

  async tick(): Promise<void> {
    this.tickCount++;
    if (this.tickCount % this.interval === 0) {
      await this.connector.connection.enqueue(new Packet());
    }
  }

  override toSnapshot(): PacketSourceSnapshot {
    return {
      ...super.toSnapshot(),
      connectorId: this.connector.id,
      interval: this.interval,
    };
  }
}
