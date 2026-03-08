import { Node, type NodeOptions } from './node';

export type ConnectorOptions = {
  inNode: Node;
  outNode: Node;
};

type _ConnectorOptions = NodeOptions & ConnectorOptions;

export class Connector extends Node {
  inNode: Node;
  outNode: Node;

  constructor(options: _ConnectorOptions) {
    super(options);
    this.inNode = options.inNode;
    this.outNode = options.outNode;
    this.type = 'connector';
  }
}
