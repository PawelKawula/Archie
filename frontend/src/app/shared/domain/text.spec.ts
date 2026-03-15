import { Text } from './text';

describe('Text', () => {
  it('should create an instance', () => {
    expect(new Text({ name: 'Default text' })).toBeTruthy();
  });
});
