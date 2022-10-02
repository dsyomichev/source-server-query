type Executor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) => void;
type ExecutorParameters<T> = Parameters<Executor<T>>;

export default class CircularPromise<T> extends Promise<T> {
  resolve: (value: T | PromiseLike<T>) => void;

  reject: (reason?: unknown) => void;

  constructor(executor: Executor<T>) {
    let args: ExecutorParameters<T> | undefined;

    function shim(this: unknown, ...rest: ExecutorParameters<T>) {
      args = rest;

      return executor.apply(this, rest);
    }

    super(shim);

    [this.resolve, this.reject] = args as unknown as ExecutorParameters<T>;
  }
}
