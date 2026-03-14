import type { FormType, T } from 'ngx-mf';
import type { Connector } from './connector';
import { Node, type NodeOptions } from './node';

export type ServerOptions = {
  connectors: Connector[];
};

export type _ServerOptions = NodeOptions & ServerOptions;

export interface ServerFormOptions {
  name: string;
  icon: string;
}

type ServerOptionsFormType = FormType<{ type: 'server' } & ServerFormOptions>;
export type ServerOptionsFormGroupType = ServerOptionsFormType[T];

export class Server extends Node {
  connectors: Connector[];
  constructor(options: _ServerOptions) {
    super(options);
    this.connectors = options.connectors ?? [];
    this.type = 'server';
  }
}
