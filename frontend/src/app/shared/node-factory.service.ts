import { Injectable } from '@angular/core';
import { Connector } from './domain/connector';
import type {
  BaseNodeFormValue,
  Node,
  NodeOptions,
  NodeTypes,
} from './domain/node';
import { Server } from './domain/server';
import { Text } from './domain/text';

@Injectable({
  providedIn: 'root',
})
export class NodeFactory {
  // biome-ignore lint/suspicious: type narrowing in createNode is sufficient
  private registry: { [K in NodeTypes]: new (arg0: any) => Node } = {
    server: Server,
    connector: Connector,
    text: Text,
  } as const;

  createNode(options: NodeOptions & BaseNodeFormValue) {
    const Constructor = this.registry[options.type];
    return new Constructor(options);
  }
}
