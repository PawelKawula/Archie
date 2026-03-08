import { Text } from './text';

describe('Text', () => {
  it('should create an instance', () => {
    expect(new Text({ text: 'Default text' })).toBeTruthy();
  });
});
