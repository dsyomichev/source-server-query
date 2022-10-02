import List from './List';

export default class Queue<T> extends List<T> {
  [Symbol.toStringTag] = 'Queue';

  get front() {
    return this.head?.value;
  }

  get back() {
    return this.tail?.value;
  }

  enqueue(value: T) {
    const node = { value };

    if (this.tail === undefined) this.head = node;
    else this.tail.next = node;

    this.tail = node;

    this.size += 1;

    return this;
  }

  dequeue() {
    if (this.head === undefined) return undefined;

    const { value } = this.head;

    this.head = this.head.next;
    if (this.head === undefined) this.tail = undefined;

    this.size -= 1;

    return value;
  }
}
