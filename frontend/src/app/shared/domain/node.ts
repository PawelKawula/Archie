import type {
  BitmapText,
  ShapePrimitive,
  Sprite,
  ViewContainer,
} from 'pixi.js';
import { v4 as uuidv4 } from 'uuid';

type NodeOptionsBase = {
  type: string;
  bounds: ShapePrimitive;
};

type SpriteNode = {
  type: 'sprite';
  sprite: Sprite;
};

type TextNode = {
  type: 'text';
  text: BitmapText;
};

export type NodeOptions = NodeOptionsBase & (SpriteNode | TextNode);

export class Node {
  bounds: ShapePrimitive;
  type: 'sprite' | 'text';
  graphics: ViewContainer;
  id: string;

  constructor(options: NodeOptions) {
    this.bounds = options.bounds;
    switch (options.type) {
      case 'sprite':
        this.graphics = options.sprite;
        break;
      case 'text':
        this.graphics = options.text;
        break;
    }
    this.type = options.type;
    this.id = uuidv4();
  }
}
