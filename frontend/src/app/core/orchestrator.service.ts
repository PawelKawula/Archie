import { Injectable, inject } from '@angular/core';
import type { Node } from '../shared/domain/node';
import { Canvas } from './canvas/canvas.service';

@Injectable({
  providedIn: 'root',
})
export class Orchestrator {
  canvas = inject(Canvas);
  private readonly _nodes: Set<Node> = new Set();

  addNode(node: Node) {
    this._nodes.add(node);
    this.canvas.app.stage.addChild(node.graphics);
  }

  removeNode(node: Node) {
    this._nodes.delete(node);
    this.canvas.app.stage.removeChild(node.graphics);
  }
}
