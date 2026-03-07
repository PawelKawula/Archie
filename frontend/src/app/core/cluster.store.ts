import {
  patchState,
  signalStore,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { Subject } from 'rxjs';
import type { Node } from '../shared/domain/node';

export type ClusterEvent =
  | { type: 'nodeAdded'; node: Node }
  | { type: 'nodeRemoved'; nodeId: string };

export type ClusterState = {
  nodes: Node[];
};

const initialState: ClusterState = {
  nodes: [],
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
  })),
);
