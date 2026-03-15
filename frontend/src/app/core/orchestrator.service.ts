import {
  computed,
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
import {
  type ConnectionPickState,
  IDLE,
  menuLabel,
  transition,
} from './connection-pick-state';

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
  readonly connectionPickState = signal<ConnectionPickState>(IDLE);

  readonly connectionMenuAction = computed(() => {
    const state = this.connectionPickState();
    return {
      label: menuLabel(state),
      handler:
        state.step === 'idle'
          ? () => this.connectionPickState.set({ step: 'pickSource' })
          : () => this.connectionPickState.set(IDLE),
    };
  });

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

  pickNodeForConnection(node: Node) {
    if (!(node instanceof Server)) return;
    const intent = transition(this.connectionPickState(), node);
    if (intent.kind === 'transition') {
      this.connectionPickState.set(intent.next);
      return;
    }
    this.connectionPickState.set(IDLE);
    this.dialogService
      .open<ConnectionOptions>({
        component: AddConnectionDialog,
        context: {},
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((options) => {
        if (!options) return;
        this.store.addConnection(
          new Connector({
            outNode: intent.source,
            inNode: intent.target,
            connectionOptions: options,
          }),
        );
      });
  }
}
