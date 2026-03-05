import type { Connector } from './connector';
import { Node, type NodeOptions } from './node';

export type ServerOptions = NodeOptions & {
  connectors: Connector[];
};

export class Server extends Node {
  connectors: Connector[];
  constructor(options: ServerOptions) {
    super(options);
    this.connectors = options.connectors ?? [];
  }
}
