export type Node<T> = {
  next?: Node<T>;
  value: T;
};

export default class List<T> implements Set<T> {
  protected head?: Node<T>;

  protected tail?: Node<T>;

  protected _size: number = 0;

  get size(): number {
    return this._size;
  }

  [Symbol.toStringTag]: string = 'List';

  *[Symbol.iterator](): IterableIterator<T> {
    let node: Node<T> | undefined = this.head;

    while (node !== undefined) {
      yield node.value;

      node = node.next;
    }
  }

  *entries(): IterableIterator<[T, T]> {
    let node: Node<T> | undefined = this.head;

    while (node !== undefined) {
      yield [node.value, node.value];

      node = node.next;
    }
  }

  keys: () => IterableIterator<T> = this[Symbol.iterator];

  values: () => IterableIterator<T> = this[Symbol.iterator];

  forEach(callback: (value: T, mirror: T, list: List<T>) => void, scope?: any): void {
    let node: Node<T> | undefined = this.head;

    while (node !== undefined) {
      callback.apply(scope, [node.value, node.value, this]);

      node = node.next;
    }
  }

  add(value: T): this {
    const node: Node<T> = { value, next: this.head };

    this.head = node;
    if (this.head.next === undefined) this.tail = this.head;

    this._size += 1;

    return this;
  }

  delete(value: T): boolean {
    let previous: Node<T> | undefined = undefined;
    let node: Node<T> | undefined = this.head;

    while (node !== undefined) {
      if (Object.is(node.value, value) === true) {
        if (previous === undefined) this.head = node.next;
        else previous.next = node.next;

        if (node.next === undefined) this.tail = previous;

        this._size -= 1;

        return true;
      }

      previous = node;
      node = node.next;
    }

    return false;
  }

  clear(): void {
    this.head = this.tail = undefined;
    this._size = 0;
  }

  has(value: T): boolean {
    let node: Node<T> | undefined = this.head;

    while (node !== undefined) {
      if (Object.is(node.value, value) === true) return true;

      node = node.next;
    }

    return false;
  }
}
