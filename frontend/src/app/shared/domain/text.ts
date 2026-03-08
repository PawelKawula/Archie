import type { FormType, T } from 'ngx-mf';
import { Node, type NodeOptions } from './node';

export interface TextOptions {
  text: string;
}

export type _TextOptions = NodeOptions & TextOptions;

type TextOptionsFormType = FormType<{ type: 'text' } & TextOptions>;
export type TextOptionsFormGroupType = TextOptionsFormType[T];

export class Text extends Node {
  text: string;
  constructor(options: _TextOptions) {
    super(options);
    this.text = options.text;
    this.type = 'text';
  }
}
