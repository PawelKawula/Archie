import { InjectionToken, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { Subject } from 'rxjs';
import type { Connector } from '../shared/domain/connector';
import type { Node } from '../shared/domain/node';
import type { ClusterSnapshot } from '../shared/domain/snapshot';

export type ClusterEvent =
  | { type: 'nodeAdded'; node: Node }
  | { type: 'nodeRemoved'; nodeId: string }
  | { type: 'nodeUpdated'; node: Node }
  | { type: 'connectionAdded'; connection: Connector }
  | { type: 'connectionRemoved'; connectionId: string };

export type ClusterState = {
  nodes: Node[];
  connections: Connector[];
};

const initialState: ClusterState = {
  nodes: [],
  connections: [],
};

export const INITIAL_CLUSTER_STATE = new InjectionToken<Partial<ClusterState>>(
  'INITIAL_CLUSTER_STATE',
  { providedIn: 'root', factory: () => ({}) },
);

export const ClusterStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({ ...initialState, ...inject(INITIAL_CLUSTER_STATE) })),
  withProps(() => {
    const _events$ = new Subject<ClusterEvent>();
    return {
      _events$,
      events$: _events$.asObservable(),
    };
  }),
  withMethods((store) => ({
    addNode(node: Node) {
      patchState(store, (state) => ({
        nodes: [...state.nodes, node],
      }));
      store._events$.next({ type: 'nodeAdded', node });
    },
    removeNode(nodeId: string) {
      patchState(store, (state) => ({
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        connections: state.connections.filter(
          (c) => c.inNode.id !== nodeId && c.outNode.id !== nodeId,
        ),
      }));
      store._events$.next({ type: 'nodeRemoved', nodeId });
    },
    addConnection(connection: Connector) {
      patchState(store, (state) => ({
        connections: [...state.connections, connection],
      }));
      store._events$.next({ type: 'connectionAdded', connection });
    },
    updateNode(
      nodeId: string,
      options: Partial<{ name: string; icon: string }>,
    ) {
      const node = store.nodes().find((n) => n.id === nodeId);
      if (!node) return;
      if (options.name !== undefined) node.name = options.name;
      if (options.icon !== undefined) node.icon = options.icon;
      patchState(store, (state) => ({ nodes: [...state.nodes] }));
      store._events$.next({ type: 'nodeUpdated', node });
    },
    removeConnection(connectionId: string) {
      patchState(store, (state) => ({
        connections: state.connections.filter((c) => c.id !== connectionId),
      }));
      store._events$.next({ type: 'connectionRemoved', connectionId });
    },
    toSnapshot(tick = 0): ClusterSnapshot {
      return {
        tick,
        nodes: store.nodes().map((n) => n.toSnapshot()),
        connections: store.connections().map((c) => c.toSnapshot()),
      };
    },
  })),
);
