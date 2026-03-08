import { Connector } from './connector';
import { Text } from './text';

describe('Connector', () => {
  it('should create an instance', () => {
    const inNode = new Text({ text: 'text' });
    const outNode = new Text({ text: 'text' });
    expect(new Connector({ inNode, outNode })).toBeTruthy();
  });
});
