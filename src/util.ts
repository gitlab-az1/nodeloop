import { assert } from '@rapid-d-kit/safe';


export function assertFunction(arg: unknown, message?: string): asserts arg is (...args: any[]) => any {
  assert(typeof arg === 'function', message);
}
