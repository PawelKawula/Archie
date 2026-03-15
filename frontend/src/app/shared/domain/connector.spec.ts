import { Connector } from './connector';
import { Text } from './text';

describe('Connector', () => {
  let inNode: Text;
  let outNode: Text;
  let connector: Connector;

  beforeEach(() => {
    inNode = new Text({ text: 'in' });
    outNode = new Text({ text: 'out' });
    connector = new Connector({ inNode, outNode });
  });

  it('should create an instance', () => {
    expect(connector).toBeTruthy();
  });

  it('toSnapshot contains fromNodeId and toNodeId', () => {
    const snap = connector.toSnapshot();
    expect(snap.fromNodeId).toBe(outNode.id);
    expect(snap.toNodeId).toBe(inNode.id);
  });

  it('toSnapshot includes base node fields', () => {
    const snap = connector.toSnapshot();
    expect(snap.id).toBe(connector.id);
    expect(snap.type).toBe('connector');
  });

  it('toSnapshot includes connection snapshot', () => {
    const snap = connector.toSnapshot();
    expect(snap.connection).toBeDefined();
    expect(snap.connection.outQueue).toEqual([]);
    expect(snap.connection.transitQueue).toEqual([]);
    expect(snap.connection.arrivedQueue).toEqual([]);
  });
});
