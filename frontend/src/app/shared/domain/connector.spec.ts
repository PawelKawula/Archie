import { Connector } from './connector';
import { Node } from './node';

describe('Connector', () => {
  it('should create an instance', () => {
    const inNode = new Node({});
    const outNode = new Node({});
    expect(new Connector({ inNode, outNode })).toBeTruthy();
  });
});
