import { beforeEach, describe, expect, it } from 'vitest';
import { Connector } from './domain/connector';
import { Server } from './domain/server';
import { Text } from './domain/text';
import { NodeFactory } from './node-factory.service';

describe('NodeFactory', () => {
  let service: NodeFactory;

  beforeEach(() => {
    service = new NodeFactory();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a Server instance when type is server', () => {
    const options = {
      type: 'server',
      name: 'Test Server',
      connectors: [],
    } as const;
    const node = service.createNode(options);
    expect(node).toBeInstanceOf(Server);
  });

  it('should create a Connector instance when type is connector', () => {
    const nodeA = new Text({ name: 'A' });
    const nodeB = new Text({ name: 'B' });
    const options = {
      type: 'connector',
      name: 'Test Connector',
      inNode: nodeA,
      outNode: nodeB,
    } as const;
    const node = service.createNode(options);
    expect(node).toBeInstanceOf(Connector);
  });

  it('should create a Text instance when type is text', () => {
    const options = {
      type: 'text',
      name: 'Test Text',
    } as const;
    const node = service.createNode(options);
    expect(node).toBeInstanceOf(Text);
  });
});
