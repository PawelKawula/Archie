import { TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { DialogService } from '../shared/dialog.service';
import { Server } from '../shared/domain/server';
import { Text } from '../shared/domain/text';
import { ClusterStore } from './cluster.store';
import { IDLE } from './connection-pick-state';
import { Orchestrator } from './orchestrator.service';

describe('Orchestrator', () => {
  const mockDialogService = { open: () => EMPTY };

  let service: Orchestrator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Orchestrator,
        ClusterStore,
        { provide: DialogService, useValue: mockDialogService },
      ],
    });
    service = TestBed.inject(Orchestrator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a node to the store', () => {
    const node = new Text({ name: 'Test Node', text: 'text' });
    service.addNode(node);

    expect(service.store.nodes().length).toBe(1);
    expect(service.store.nodes()[0].id).toBe(node.id);
  });

  it('should remove a node from the store', () => {
    const node = new Text({ name: 'Test Node', text: 'text' });
    service.addNode(node);
    service.removeNode(node.id);

    expect(service.store.nodes().length).toBe(0);
  });

  describe('connectionPickState', () => {
    it('starts in idle state', () => {
      expect(service.connectionPickState()).toEqual(IDLE);
    });

    it('connectionMenuAction label is "Create connection" in idle', () => {
      expect(service.connectionMenuAction().label).toBe('Create connection');
    });

    it('connectionMenuAction handler moves state to pickSource', () => {
      service.connectionMenuAction().handler();
      expect(service.connectionPickState().step).toBe('pickSource');
    });

    it('connectionMenuAction label is "Cancel connection" when not idle', () => {
      service.connectionMenuAction().handler();
      expect(service.connectionMenuAction().label).toBe('Cancel connection');
    });

    it('connectionMenuAction cancel handler returns to idle', () => {
      service.connectionMenuAction().handler(); // idle → pickSource
      service.connectionMenuAction().handler(); // pickSource → idle
      expect(service.connectionPickState()).toEqual(IDLE);
    });
  });

  describe('pickNodeForConnection', () => {
    it('ignores non-Server nodes and leaves state unchanged', () => {
      service.connectionMenuAction().handler(); // idle → pickSource
      service.pickNodeForConnection(new Text({ text: 'hi' }));
      expect(service.connectionPickState().step).toBe('pickSource');
    });

    it('in idle state keeps idle when a Server is picked', () => {
      service.pickNodeForConnection(
        new Server({ name: 'S', icon: 'x', connectors: [] }),
      );
      expect(service.connectionPickState()).toEqual(IDLE);
    });

    it('in pickSource transitions to pickTarget with the picked server as source', () => {
      const server = new Server({ name: 'S', icon: 'x', connectors: [] });
      service.connectionMenuAction().handler(); // idle → pickSource
      service.pickNodeForConnection(server);

      const state = service.connectionPickState();
      expect(state.step).toBe('pickTarget');
      if (state.step === 'pickTarget') {
        expect(state.source).toBe(server);
      }
    });

    it('in pickTarget resets to idle after picking the target server', () => {
      const server1 = new Server({ name: 'A', icon: 'x', connectors: [] });
      const server2 = new Server({ name: 'B', icon: 'x', connectors: [] });
      service.connectionMenuAction().handler(); // idle → pickSource
      service.pickNodeForConnection(server1); // pickSource → pickTarget
      service.pickNodeForConnection(server2); // pickTarget → idle + dialog
      expect(service.connectionPickState()).toEqual(IDLE);
    });
  });
});
