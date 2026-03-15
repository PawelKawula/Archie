import { Packet } from './packet';

describe('Packet', () => {
  it('should create an instance', () => {
    expect(new Packet()).toBeTruthy();
  });

  it('toSnapshot returns id and content', () => {
    const packet = new Packet({ content: 'hello' });
    expect(packet.toSnapshot()).toEqual({ id: packet.id, content: 'hello' });
  });

  it('toSnapshot defaults content to empty string', () => {
    const packet = new Packet();
    expect(packet.toSnapshot().content).toBe('');
  });
});
