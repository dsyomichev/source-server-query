class CircularPromise<T> extends Promise<T> {
  resolve: (value: T | PromiseLike<T>) => void;

  reject: (reason?: any) => void;
}

export default CircularPromise;
