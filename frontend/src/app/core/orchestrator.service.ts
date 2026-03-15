import {
  DestroyRef,
  Injectable,
  inject,
  signal,
  type TemplateRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { FederatedPointerEvent } from 'pixi.js';
import { AddConnectionDialog } from '../shared/add-connection-dialog/add-connection-dialog.component';
import { AddNodeDialog } from '../shared/add-node-dialog/add-node-dialog.component';
import { ContextMenu } from '../shared/context-menu.service';
import { DialogService } from '../shared/dialog.service';
import type { ConnectionOptions } from '../shared/domain/connection';
import { Connector } from '../shared/domain/connector';
import type { Node, NodeTypes } from '../shared/domain/node';
import { Server } from '../shared/domain/server';
import { NodeFactory } from '../shared/node-factory.service';
import { ClusterStore } from './cluster.store';

type ConnectionPickState =
  | null
  | { step: 'pickSource' }
  | { step: 'pickTarget'; source: Server };

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
  readonly connectionPickState = signal<ConnectionPickState>(null);

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

  startConnectionCreation() {
    this.connectionPickState.set({ step: 'pickSource' });
  }

  cancelConnectionCreation() {
    this.connectionPickState.set(null);
  }

  pickNodeForConnection(node: Node) {
    if (!(node instanceof Server)) return;

    const state = this.connectionPickState();
    if (!state) return;

    if (state.step === 'pickSource') {
      this.connectionPickState.set({ step: 'pickTarget', source: node });
      return;
    }

    const source = state.source;
    this.connectionPickState.set(null);

    this.dialogService
      .open<ConnectionOptions>({
        component: AddConnectionDialog,
        context: {},
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((options) => {
        if (!options) return;
        const connector = new Connector({
          outNode: source,
          inNode: node,
          connectionOptions: options,
        });
        this.store.addConnection(connector);
      });
  }
}
