import { AssertionError } from './exceptions';

function assert(assertion: boolean, msg: string) {
  console.assert(assertion, msg);
  if (!assertion) {
    throw new AssertionError(msg);
  }
}
