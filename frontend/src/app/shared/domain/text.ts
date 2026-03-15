import type { FormType, T } from 'ngx-mf';
import { Node, type NodeOptions } from './node';

type TextOptionsFormType = FormType<{ type: 'text'; name: string }>;
export type TextOptionsFormGroupType = TextOptionsFormType[T];

export class Text extends Node {
  constructor(options: NodeOptions) {
    super(options);
    this.type = 'text';
  }
}
