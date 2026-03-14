import { AssertionError } from './exceptions';

export function assert(assertion: boolean, msg: string) {
  console.assert(assertion, msg);
  if (!assertion) {
    throw new AssertionError(msg);
  }
}
