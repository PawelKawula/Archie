import { Injectable, inject, signal, type TemplateRef } from '@angular/core';
import type { FederatedPointerEvent } from 'pixi.js';
import { ContextMenu } from '../shared/context-menu.service';
import type { Node } from '../shared/domain/node';
import { ClusterStore } from './cluster.store';

@Injectable({
  providedIn: 'root',
})
export class Orchestrator {
  readonly store = inject(ClusterStore);
  private readonly contextMenu = inject(ContextMenu);

  readonly nodeMenuTemplate = signal<TemplateRef<unknown> | null>(null);

  addNode(node: Node) {
    this.store.addNode(node);
  }

  removeNode(nodeId: string) {
    this.store.removeNode(nodeId);
  }

  handleNodeRightClick(node: Node, event: FederatedPointerEvent) {
    this.contextMenu.show({
      event,
      template: this.nodeMenuTemplate(),
      data: node,
    });
  }
}
