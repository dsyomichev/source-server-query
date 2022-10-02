/* eslint-disable @typescript-eslint/dot-notation */

// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from '@jest/globals';
import List, { Node } from '../lib/List';
import Queue from '../lib/Queue';

const $expect = {
  empty: (list: List<unknown>): void => {
    expect(list.size).toBe(0);
    expect(list['head']).toBeUndefined();
    expect(list['tail']).toBeUndefined();
  },

  chained: (head: Node<unknown>, tail: Node<unknown>): void => {
    let node = head;
    while (node.next !== undefined) node = node.next;

    expect(node).toStrictEqual(tail);
  },

  ordered: (list: List<unknown>, expected: unknown[]) => {
    let node = list['head'];
    let i = 0;

    while (node !== undefined) {
      expect(node.value).toBe(expected[i]);

      i += 1;
      node = node.next;
    }

    expect(i).toBe(expected.length);
  },
};

describe('class Queue', () => {
  let queue = new Queue<number>();

  beforeEach(() => {
    queue = new Queue();
  });

  describe('new Queue()', () => {
    test('queue is initialized', () => {
      expect(queue[Symbol.toStringTag]).toBe('Queue');
    });

    test('queue is empty', () => {
      $expect.empty(queue);

      expect(queue.front).toBeUndefined();
      expect(queue.back).toBeUndefined();
    });
  });

  describe('enqueue()', () => {
    test('size is incremented', () => {
      const iterations = 10;

      for (let i = 0; i < iterations; i += 1) {
        queue.enqueue(i);

        expect(queue.size).toBe(i + 1);
      }
    });

    test('head and tail are managed', () => {
      const iterations = 10 ** 3;

      for (let i = 0; i < iterations; i += 1) {
        queue.enqueue(i);

        expect(queue.front).toBe(0);
        expect(queue.back).toBe(i);
      }
    });

    test('list is linked', () => {
      const iterations = 10 ** 3;

      for (let i = 0; i < iterations; i += 1) {
        queue.enqueue(i);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $expect.chained(queue['head']!, queue['tail']!);
      }
    });

    test('order is maintained', () => {
      const iterations = 10 ** 2;

      for (let i = 0; i < iterations; i += 1) {
        const expected = [...Array(i + 1).keys()];
        queue.enqueue(i);

        $expect.ordered(queue, expected);
      }
    });
  });

  describe('dequeue()', () => {
    test('queue is empty', () => {
      expect(queue.dequeue()).toBeUndefined();
    });

    test('final element is removed', () => {
      queue.add(0);

      expect(queue.dequeue()).toBe(0);
      $expect.empty(queue);
    });

    test('size is decremented', () => {
      const iterations = 10 ** 3;

      for (let i = 0; i < iterations; i += 1) queue.add(i);

      for (let i = 0; i < iterations - 1; i += 1) {
        queue.dequeue();

        expect(queue.size).toBe(iterations - i - 1);
      }
    });

    test('head and tail are managed', () => {
      const iterations = 10 ** 3;

      for (let i = 0; i < iterations; i += 1) queue.add(i);

      for (let i = 0; i < iterations - 1; i += 1) {
        queue.dequeue();

        expect(queue.front).toBe(iterations - i - 2);
        expect(queue.back).toBe(0);
      }
    });

    test('list is linked', () => {
      const iterations = 10 ** 3;

      for (let i = 0; i < iterations; i += 1) queue.add(i);

      for (let i = 0; i < iterations - 1; i += 1) {
        queue.dequeue();

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $expect.chained(queue['head']!, queue['tail']!);
      }
    });

    test('order is maintained', () => {
      const iterations = 10 ** 2;

      for (let i = 0; i < iterations; i += 1) queue.add(i);

      for (let i = 0; i < iterations - 1; i += 1) {
        queue.dequeue();

        const expected = [...Array(iterations - i - 1).keys()].reverse();

        $expect.ordered(queue, expected);
      }
    });
  });
});
