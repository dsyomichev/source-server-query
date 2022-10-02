class CircularPromise extends Promise {
  constructor(executor) {
    let parameters;

    const callback = (...rest) => {
      parameters = Array.from(rest);

      return executor.apply(this, rest);
    };

    super(callback);

    [this.resolve, this.reject] = parameters;
  }
}

export default CircularPromise;
