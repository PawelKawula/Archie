import { Server } from '../shared/domain/server';
import { IDLE, menuLabel, transition } from './connection-pick-state';

describe('connection-pick-state', () => {
  let server1: Server;
  let server2: Server;

  beforeEach(() => {
    server1 = new Server({ name: 'A', icon: 'x', connectors: [] });
    server2 = new Server({ name: 'B', icon: 'x', connectors: [] });
  });

  describe('menuLabel', () => {
    it('returns "Create connection" for idle', () => {
      expect(menuLabel(IDLE)).toBe('Create connection');
    });

    it('returns "Cancel connection" for pickSource', () => {
      expect(menuLabel({ step: 'pickSource' })).toBe('Cancel connection');
    });

    it('returns "Cancel connection" for pickTarget', () => {
      expect(menuLabel({ step: 'pickTarget', source: server1 })).toBe(
        'Cancel connection',
      );
    });
  });

  describe('transition', () => {
    it('idle stays idle regardless of which server is picked', () => {
      const intent = transition(IDLE, server1);
      expect(intent.kind).toBe('transition');
      if (intent.kind === 'transition') {
        expect(intent.next).toEqual(IDLE);
      }
    });

    it('pickSource transitions to pickTarget with the picked server as source', () => {
      const intent = transition({ step: 'pickSource' }, server1);
      expect(intent.kind).toBe('transition');
      if (intent.kind === 'transition') {
        expect(intent.next).toEqual({ step: 'pickTarget', source: server1 });
      }
    });

    it('pickTarget emits openDialog intent with correct source and target', () => {
      const intent = transition(
        { step: 'pickTarget', source: server1 },
        server2,
      );
      expect(intent.kind).toBe('openDialog');
      if (intent.kind === 'openDialog') {
        expect(intent.source).toBe(server1);
        expect(intent.target).toBe(server2);
      }
    });

    it('pickTarget with same server as source still emits openDialog', () => {
      const intent = transition(
        { step: 'pickTarget', source: server1 },
        server1,
      );
      expect(intent.kind).toBe('openDialog');
      if (intent.kind === 'openDialog') {
        expect(intent.source).toBe(server1);
        expect(intent.target).toBe(server1);
      }
    });
  });
});
