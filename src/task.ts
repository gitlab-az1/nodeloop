import { promises } from '@rapid-d-kit/async';

import { assertFunction } from './util';
import type { TaskExecutor } from './typedef';


type Completed<T> = { status: 'fulfilled'; value: T };
type Failed<E extends Error> = { status: 'error'; error: E };
type TaskResult<T, E extends Error = Error> = Completed<T> | Failed<E>;


/**
 * Represents an asynchronous task that can be executed and waited on.
 *
 * @template TArgs - Tuple of argument types passed to the executor
 * @template TReturn - Return type of the task executor
 * @template TErr - Type of error that may be thrown (default: Error)
 */
class Task<TArgs extends any[] = [], TReturn = unknown, TErr extends Error = Error> {
  readonly #executor: TaskExecutor<TArgs, TReturn>;
  readonly #onError?: (err: TErr) => unknown;
  #promise?: Promise<TReturn>;
  #result: TaskResult<TReturn>;

  public constructor(_executor: TaskExecutor<TArgs, TReturn>, _onerror?: (err: TErr) => unknown) {
    assertFunction(_executor);

    this.#executor = _executor;
    this.#onError = _onerror;
  }

  /**
   * Waits for the task to complete and returns the result.
   * If the task has already completed, returns the cached result or throws the stored error.
   *
   * @param args - Optional arguments passed to the executor function
   * @returns A promise resolving with the task's result
   */
  public wait(args?: TArgs): Promise<TReturn> {
    if(!this.#promise) {
      this.#promise = this.#start(...((args ?? []) as unknown as any));
    }

    if(!this.#result)
      return this.#promise;

    if(this.#result.status === 'fulfilled')
      return Promise.resolve(this.#result.value);

    throw this.#result.error;
  }

  #start(...args: TArgs): Promise<TReturn> {
    return promises.withAsyncBody(async resolve => {
      try {
        const value = await this.#executor(...args);

        this.#result = { status: 'fulfilled', value };
        resolve(value); 
      } catch (error: any) {
        this.#result = { status: 'error', error };

        if(typeof this.#onError === 'function') {
          this.#onError(error);
          return;
        }

        throw error;
      }
    });
  }
}

export default Task;
