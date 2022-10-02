import { describe, expect, test } from '@jest/globals';
import List, { Node } from '../lib/List';

const $expect = {
  empty: (list: List<unknown>): void => {
    expect(list.size).toBe(0);
    expect(list['head']).toBeUndefined;
    expect(list['tail']).toBeUndefined;
  },

  chained: (head: Node<unknown>, tail: Node<unknown>): void => {
    let node: Node<unknown> = head;
    while (node.next !== undefined) node = node.next;

    expect(node).toStrictEqual(tail);
  },

  ordered: (list: List<unknown>, expected: unknown[]) => {
    let node: Node<unknown> | undefined = list['head'];
    let i: number = 0;

    while (node !== undefined) {
      expect(node.value).toBe(expected[i++]);
      node = node.next;
    }

    expect(i).toBe(expected.length);
  },
};

describe('class List', () => {
  let list: List<any> = new List();
  beforeEach(() => (list = new List()));

  describe('new List()', () => {
    test('list is initialized', () => {
      expect(list[Symbol.toStringTag]).toBe('List');
    });

    test('list is empty', () => {
      $expect.empty(list);
    });
  });

  describe('add()', () => {
    test('size is incremented', () => {
      const iterations: number = 10;

      for (let i = 0; i < iterations; i += 1) {
        list.add(i);

        expect(list.size).toBe(i + 1);
      }
    });

    test('head and tail are managed', () => {
      const iterations: number = 10000;

      for (let i = 0; i < iterations; i += 1) {
        list.add(i);

        expect(list['head']?.value).toBe(i);
        expect(list['tail']?.value).toBe(0);
      }
    });

    test('list is linked', () => {
      const iterations: number = 100;

      for (let i = 0; i < iterations; i += 1) {
        list.add(i);

        $expect.chained(list['head'] as Node<number>, list['tail'] as Node<number>);
      }
    });

    test('order is maintained', () => {
      const iterations: number = 100;

      for (let i = 0; i < iterations; i += 1) {
        const expected: number[] = [...Array(i + 1).keys()].reverse();
        list.add(i);

        $expect.ordered(list, expected);
      }
    });
  });

  describe('clear()', () => {
    test('list is empty', () => {
      const iterations: number = 10;

      for (let i = 0; i < iterations; i += 1) {
        for (let j = 0; j < iterations; j += 1) list.add(j);

        list.clear();

        $expect.empty(list);
      }
    });
  });

  describe('delete()', () => {
    test('value is not present', () => {
      const iterations: number = 10;

      for (let i = 0; i < iterations; i += 1) list.add(i);

      expect(list.delete(iterations)).toBe(false);
    });

    test('size is decremented', () => {
      const iterations: number = 10;

      for (let i = 0; i < iterations; i += 1) list.add(i);

      for (let i = iterations - 1; i > 0; i -= 1) {
        list.delete(i);

        expect(list.size).toBe(i);
      }
    });

    describe('value = (head && tail)', () => {
      list.add(0);
      list.delete(0);

      $expect.empty(list);
    });

    describe('value = (head)', () => {
      test('head and tail are managed', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = 0; i < iterations - 1; i += 1) {
          list.delete(i);

          expect(list['head']?.value).toBe(iterations - 1);
          expect(list['tail']?.value).toBe(i + 1);
        }
      });

      test('list is linked', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = 0; i < iterations - 1; i += 1) {
          list.delete(i);

          $expect.chained(list['head'] as Node<number>, list['tail'] as Node<number>);
        }
      });

      test('order is maintained', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = 0; i < iterations - 1; i += 1) {
          list.delete(i);

          const expected: number[] = [...Array(iterations).keys()].reverse().slice(0, -1 * (i + 1));

          $expect.ordered(list, expected);
        }
      });
    });

    describe('value = (tail)', () => {
      test('head and tail are managed', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = iterations - 1; i > 1; i -= 1) {
          list.delete(i);

          expect(list['head']?.value).toBe(i - 1);
          expect(list['tail']?.value).toBe(0);
        }
      });

      test('list is linked', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = iterations - 1; i > 1; i -= 1) {
          list.delete(i);

          $expect.chained(list['head'] as Node<number>, list['tail'] as Node<number>);
        }
      });

      test('order is maintained', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = iterations - 1; i > 1; i -= 1) {
          list.delete(i);

          const expected: number[] = [...Array(iterations).keys()].reverse().slice(iterations - i);

          $expect.ordered(list, expected);
        }
      });
    });

    describe('value = (!head && !tail)', () => {
      test('head and tail are managed', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = 1; i < iterations - 2; i += 1) {
          list.delete(i);

          expect(list['head']?.value).toBe(iterations - 1);
          expect(list['tail']?.value).toBe(0);
        }
      });

      test('list is linked', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = 1; i < iterations - 2; i += 1) {
          list.delete(i);

          $expect.chained(list['head'] as Node<number>, list['tail'] as Node<number>);
        }
      });

      test('order is maintained', () => {
        const iterations: number = 10;

        for (let i = 0; i < iterations; i += 1) list.add(i);

        for (let i = 1; i < iterations - 2; i += 1) {
          list.delete(i);

          const subarray: number[] = [...Array(iterations).keys()].reverse().slice(1, -1 * (i + 1));
          const expected: number[] = [iterations - 1, ...subarray, 0];

          $expect.ordered(list, expected);
        }
      });
    });
  });

  describe('has()', () => {
    test('value is present', () => {
      const iterations: number = 10;

      for (let i = 0; i < iterations; i += 1) list.add(i);

      for (let i = 0; i < iterations; i += 1) expect(list.has(i)).toBe(true);
    });

    test('value is not present', () => {
      const iterations: number = 10;

      for (let i = 0; i < iterations; i += 1) list.add(i);

      expect(list.has(iterations)).toBe(false);
    });
  });

  describe('*[Symbol.iterator]()', () => {
    test('yields for each value', () => {
      const iterations: number = 100;

      for (let i = 0; i < iterations; i += 1) list.add(i);

      let counter: number = 0;

      for (let value of list) counter += 1;

      expect(counter).toBe(iterations);
    });

    test('order is maintained', () => {
      const iterations: number = 100;
      let expected: number[] = [];

      for (let i = 0; i < iterations; i += 1) {
        const value = Math.floor(Math.random() * 10);

        list.add(value);
        expected.unshift(value);
      }

      expect(Array.from(list)).toStrictEqual(expected);
    });
  });

  describe('*entries()', () => {
    test('yields for each value', () => {
      const iterations: number = 100;

      for (let i = 0; i < iterations; i += 1) list.add(i);

      let counter: number = 0;

      for (let value of list.entries()) counter += 1;

      expect(counter).toBe(iterations);
    });

    test('order is maintained', () => {
      const iterations: number = 100;

      let expected: [number, number][] = [];

      for (let i = 0; i < iterations; i += 1) {
        const value = Math.floor(Math.random() * 10);

        list.add(value);
        expected.unshift([value, value]);
      }

      expect(Array.from(list.entries())).toStrictEqual(expected);
    });
  });

  describe('forEach()', () => {
    test('yields for each value', () => {
      const iterations: number = 100;

      for (let i = 0; i < iterations; i += 1) list.add(i);

      let counter: number = 0;

      list.forEach((value) => (counter += 1));

      expect(counter).toBe(iterations);
    });

    test('order is maintained', () => {
      const iterations: number = 100;

      let expected: number[] = [];

      for (let i = 0; i < iterations; i += 1) {
        const value = Math.floor(Math.random() * 10);

        list.add(value);
        expected.unshift(value);
      }

      const result: number[] = [];

      list.forEach((value) => result.push(value));

      expect(result).toStrictEqual(expected);
    });

    test('scope is modified', () => {
      const iterations = 10;

      for (let i = 0; i < iterations; i += 1) list.add(1);

      const accumulator: Record<string, number> = { value: 0 };

      const callback = function (this: Record<string, number>, value: number) {
        this.value += value;
      };

      list.forEach(callback, accumulator);

      expect(accumulator.value).toBe(iterations);
    });
  });
});
