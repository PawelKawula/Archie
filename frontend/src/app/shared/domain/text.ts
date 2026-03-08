import { Node, type NodeOptions } from './node';

export interface TextOptions extends NodeOptions {
  text: string;
}

export class Text extends Node {
  text: string;
  constructor(options: TextOptions) {
    super(options);
    this.text = options.text;
  }
}
