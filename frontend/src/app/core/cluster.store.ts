import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { Node } from '../shared/domain/node';

export type ClusterState = {
  nodes: Node[];
};

const initialState: ClusterState = {
  nodes: [],
};

export const ClusterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    addNode(node: Node) {
      patchState(store, (state) => ({
        nodes: [...state.nodes, node],
      }));
    },
    removeNode(nodeId: string) {
      patchState(store, (state) => ({
        nodes: state.nodes.filter((n) => n.id !== nodeId),
      }));
    },
  })),
);
