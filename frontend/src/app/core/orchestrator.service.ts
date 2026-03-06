import { Injectable, inject, signal, type TemplateRef } from '@angular/core';
import { ContextMenu } from '../shared/context-menu.service';
import type { Node } from '../shared/domain/node';
import { Canvas } from './canvas/canvas.service';

@Injectable({
  providedIn: 'root',
})
export class Orchestrator {
  canvas = inject(Canvas);
  private readonly _nodes: Set<Node> = new Set();
  private readonly contextMenu = inject(ContextMenu);

  readonly nodeMenuTemplate = signal<TemplateRef<unknown> | null>(null);

  addNode(node: Node) {
    this._nodes.add(node);
    this.canvas.app.stage.addChild(node.graphics);

    node.graphics.eventMode = 'static';

    node.graphics.on('rightclick', (ev) => {
      ev.stopPropagation();
      this.contextMenu.show({
        event: ev.nativeEvent as PointerEvent,
        template: this.nodeMenuTemplate(),
        data: node,
      });
    });
  }

  removeNode(node: Node) {
    this._nodes.delete(node);
    this.canvas.app.stage.removeChild(node.graphics);
  }
}
