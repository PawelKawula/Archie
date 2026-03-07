import { TestBed } from '@angular/core/testing';
import { Node } from '../shared/domain/node';
import { Orchestrator } from './orchestrator.service';

describe('Orchestrator', () => {
  let service: Orchestrator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Orchestrator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a node to the store', () => {
    const node = new Node({ type: 'sprite', name: 'Test Node' });
    service.addNode(node);

    expect(service.store.nodes().length).toBe(1);
    expect(service.store.nodes()[0].id).toBe(node.id);
  });

  it('should remove a node from the store', () => {
    const node = new Node({ type: 'sprite', name: 'Test Node' });
    service.addNode(node);
    service.removeNode(node.id);

    expect(service.store.nodes().length).toBe(0);
  });
});
