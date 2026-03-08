import {
  DestroyRef,
  Injectable,
  inject,
  signal,
  type TemplateRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { FederatedPointerEvent } from 'pixi.js';
import { AddNodeDialog } from '../shared/add-node-dialog/add-node-dialog.component';
import { ContextMenu } from '../shared/context-menu.service';
import { DialogService } from '../shared/dialog.service';
import type { Node, NodeTypes } from '../shared/domain/node';
import { NodeFactory } from '../shared/node-factory.service';
import { ClusterStore } from './cluster.store';

@Injectable({
  providedIn: 'root',
})
export class Orchestrator {
  readonly store = inject(ClusterStore);
  private readonly contextMenu = inject(ContextMenu);
  private readonly dialogService = inject(DialogService);
  private readonly nodeFactory = inject(NodeFactory);
  private readonly destroyRef = inject(DestroyRef);

  readonly nodeMenuTemplate = signal<TemplateRef<unknown> | null>(null);
  readonly stageMenuTemplate = signal<TemplateRef<unknown> | null>(null);

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

  openAddNodeDialog(x: number, y: number) {
    this.dialogService
      .open<{ type: NodeTypes }>({
        component: AddNodeDialog,
        context: {},
        backdropClass: 'bg-transparent',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => {
        if (!v) return;
        const node = this.nodeFactory.createNode({ ...v, x, y });
        this.addNode(node);
      });
  }
}
