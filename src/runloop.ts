import Task from './task';
import type { TaskExecutor } from './typedef';


/**
 * EventLoop class provides an abstraction over task management and 
 * simple event-driven control flow, including task creation, execution, 
 * sleeping, and condition waiting.
 */
class EventLoop {
  readonly #tasks: Task<any, any, any>[] = [];

  /**
   * Creates a new task and adds it to the internal task list.
   *
   * @template TReturn The type of the task's return value
   * @template TArgs The tuple type of the task's arguments
   * @param executor - A function that performs the asynchronous task
   * @param onerror - Optional error handler for the task
   * @returns The created Task instance
   */
  public createTask<TReturn = unknown, TArgs extends unknown[] = any[]>(
    executor: TaskExecutor<TArgs, TReturn>,
    onerror?: (err: Error) => unknown // eslint-disable-line comma-dangle
  ): Task<TArgs, TReturn, Error> {
    const task = new Task<TArgs, TReturn, Error>(executor, onerror);

    this.#tasks.push(task);
    return task;
  }

  /**
   * Runs a single method as a task and waits for all created tasks to complete.
   *
   * @param method - The function to be run as a task
   * @returns A promise that resolves when all tasks have completed
   */
  public async run(method: TaskExecutor<never, void>): Promise<void> {
    this.createTask(method);
    await Promise.all(this.#tasks.map(t => t.wait()));
  }

  /**
   * Repeatedly checks the condition until it returns true.
   * 
   * @param condition A function returning a boolean or Promise<boolean>
   * @param interval Interval in ms to wait between checks
   */
  public async until(condition: () => boolean | Promise<boolean>, interval: number = 100): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while(true) {
      if(await condition()) break;
      await this.sleep_ms(interval);
    }
  }

  /**
   * Delays execution for the specified number of milliseconds.
   *
   * @param timeout - Duration to sleep in milliseconds (default: 750ms)
   * @returns A promise that resolves after the timeout
   */
  public sleep_ms(timeout?: number): Promise<void> {
    return sleep(timeout);
  }
}


/**
 * Delays execution for a given duration.
 *
 * @param timeout - Duration in milliseconds to delay (default: 750ms)
 * @returns A promise that resolves after the delay
 */
export function sleep(timeout: number = 750): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, timeout));
}


export default EventLoop;
