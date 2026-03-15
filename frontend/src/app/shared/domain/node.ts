import type { FormType, G, T } from 'ngx-mf';
import { v4 as uuidv4 } from 'uuid';
import type { NodeSnapshot } from './snapshot';

export const NODE_TYPES = ['text', 'server', 'connector'] as const;

export type NodeTypes = (typeof NODE_TYPES)[number];

export type BaseNodeFormValue = { type: NodeTypes };

export type NodeFormType = FormType<BaseNodeFormValue>;
export type NodeFormGroupType = NodeFormType[T];
export type NodeFormGroupKeysType = NodeFormType[G];

export type NodeOptions = {
  name?: string;
  x?: number;
  y?: number;
  icon?: string;
};

export abstract class Node {
  readonly id: string;
  type!: NodeTypes;
  name: string;
  icon: string;
  x: number;
  y: number;

  constructor(options: NodeOptions) {
    this.id = uuidv4();
    this.name = options.name ?? 'New Node';
    this.icon = options.icon ?? 'default';
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
  }

  toSnapshot(): NodeSnapshot {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      icon: this.icon,
      x: this.x,
      y: this.y,
    };
  }
}
