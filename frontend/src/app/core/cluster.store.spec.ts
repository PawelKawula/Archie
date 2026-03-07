import { TestBed } from '@angular/core/testing';
import { Node } from '../shared/domain/node';
import { ClusterStore } from './cluster.store';

describe('ClusterStore', () => {
  let store: InstanceType<typeof ClusterStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClusterStore],
    });
    store = TestBed.inject(ClusterStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should add a node', () => {
    const node = new Node({ type: 'sprite' });
    store.addNode(node);
    expect(store.nodes()).toContain(node);
  });

  it('should remove a node', () => {
    const node = new Node({ type: 'sprite' });
    store.addNode(node);
    store.removeNode(node.id);
    expect(store.nodes()).not.toContain(node);
  });
});
