export interface Node<T> {
  next?: Node<T>;
  value: T;
}

export default class List<T> implements Set<T> {
  [Symbol.toStringTag] = 'List';

  protected head?: Node<T>;

  protected tail?: Node<T>;

  #size = 0;

  get size() {
    return this.#size;
  }

  protected set size(value) {
    this.#size = value;
  }

  *[Symbol.iterator]() {
    let node = this.head;

    while (node !== undefined) {
      yield node.value;

      node = node.next;
    }
  }

  *entries(): Generator<[T, T], void> {
    let node = this.head;

    while (node !== undefined) {
      yield [node.value, node.value];

      node = node.next;
    }
  }

  keys = this[Symbol.iterator];

  values = this[Symbol.iterator];

  forEach(callback: (value: T, mirror: T, list: List<T>) => void, scope?: unknown) {
    let node = this.head;

    while (node !== undefined) {
      callback.apply(scope, [node.value, node.value, this]);

      node = node.next;
    }
  }

  add(value: T) {
    const node = { value, next: this.head };

    this.head = node;
    if (this.head.next === undefined) this.tail = this.head;

    this.size += 1;

    return this;
  }

  delete(value: T) {
    let previous;
    let node = this.head;

    while (node !== undefined) {
      if (Object.is(node.value, value)) {
        if (previous === undefined) this.head = node.next;
        else previous.next = node.next;

        if (node.next === undefined) this.tail = previous;

        this.size -= 1;

        return true;
      }

      previous = node;
      node = node.next;
    }

    return false;
  }

  clear() {
    this.head = undefined;
    this.tail = undefined;
    this.size = 0;
  }

  has(value: T) {
    let node = this.head;

    while (node !== undefined) {
      if (Object.is(node.value, value)) return true;

      node = node.next;
    }

    return false;
  }
}
