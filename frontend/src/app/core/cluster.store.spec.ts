import { TestBed } from '@angular/core/testing';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
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

  it('should add a node and emit event', () => {
    const observerSpy = subscribeSpyTo(store.events$);

    const node = new Node({});
    store.addNode(node);

    expect(store.nodes()).toContain(node);
    expect(observerSpy.getLastValue()).toEqual({ type: 'nodeAdded', node });
  });

  it('should remove a node and emit event', () => {
    const node = new Node({});
    store.addNode(node);

    const observerSpy = subscribeSpyTo(store.events$);

    store.removeNode(node.id);

    expect(store.nodes()).not.toContain(node);
    expect(observerSpy.getLastValue()).toEqual({
      type: 'nodeRemoved',
      nodeId: node.id,
    });
  });
});
