import { Connection, type ConnectionOptions } from './connection';
import { Node, type NodeOptions } from './node';
import type { ConnectorSnapshot } from './snapshot';

export type ConnectorOptions = {
  inNode: Node;
  outNode: Node;
  connectionOptions?: ConnectionOptions;
};

type _ConnectorOptions = NodeOptions & ConnectorOptions;

export class Connector extends Node {
  inNode: Node;
  outNode: Node;
  connection: Connection;

  constructor(options: _ConnectorOptions) {
    super(options);
    this.connection = new Connection(options.connectionOptions);
    this.inNode = options.inNode;
    this.outNode = options.outNode;
    this.type = 'connector';
  }

  override toSnapshot(): ConnectorSnapshot {
    return {
      ...super.toSnapshot(),
      fromNodeId: this.outNode.id,
      toNodeId: this.inNode.id,
      connection: this.connection.toSnapshot(),
    };
  }
}
