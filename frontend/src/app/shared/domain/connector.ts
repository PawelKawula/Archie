import type { Node } from './node';

export type ConnectorOptions = {
  inNode: Node;
  outNode: Node;
};

export class Connector {
  inNode: Node;
  outNode: Node;

  constructor(options: ConnectorOptions) {
    this.inNode = options.inNode;
    this.outNode = options.outNode;
  }
}
