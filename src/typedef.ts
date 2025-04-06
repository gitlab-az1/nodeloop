export type TaskExecutor<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;
