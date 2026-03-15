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
  | { type: 'connectionAdded'; connection: Connector };

export type ClusterState = {
  nodes: Node[];
  connections: Connector[];
};

const initialState: ClusterState = {
  nodes: [],
  connections: [],
};

export const ClusterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
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
      }));
      store._events$.next({ type: 'nodeRemoved', nodeId });
    },
    addConnection(connection: Connector) {
      patchState(store, (state) => ({
        connections: [...state.connections, connection],
      }));
      store._events$.next({ type: 'connectionAdded', connection });
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
