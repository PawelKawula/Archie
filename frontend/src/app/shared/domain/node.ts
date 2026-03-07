import { v4 as uuidv4 } from 'uuid';

export interface NodeOptions {
  name?: string;
  x?: number;
  y?: number;
  icon?: string;
}

export class Node {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  x: number;
  y: number;

  constructor(options: NodeOptions) {
    this.id = uuidv4();
    this.name = options.name ?? 'New Node';
    this.icon = options.icon ?? 'default';
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
  }
}
