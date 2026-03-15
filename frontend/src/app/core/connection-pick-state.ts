import type { Server } from '../shared/domain/server';

export type ConnectionPickState =
  | { step: 'idle' }
  | { step: 'pickSource' }
  | { step: 'pickTarget'; source: Server };

export type PickIntent =
  | { kind: 'transition'; next: ConnectionPickState }
  | { kind: 'openDialog'; source: Server; target: Server };

export const IDLE: ConnectionPickState = { step: 'idle' };

export function transition(
  state: ConnectionPickState,
  node: Server,
): PickIntent {
  switch (state.step) {
    case 'idle':
      return { kind: 'transition', next: IDLE };
    case 'pickSource':
      return { kind: 'transition', next: { step: 'pickTarget', source: node } };
    case 'pickTarget':
      return { kind: 'openDialog', source: state.source, target: node };
  }
}

export function menuLabel(state: ConnectionPickState): string {
  return state.step === 'idle' ? 'Create connection' : 'Cancel connection';
}
