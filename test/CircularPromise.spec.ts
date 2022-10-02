// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, test } from '@jest/globals';
import CircularPromise from '../lib/CircularPromise';

describe('class CircularPromise', () => {
  describe('new CircularPromise()', () => {
    test('methods are exposed', () => {
      const promise = new CircularPromise<unknown>(() => {});

      expect(promise.resolve).toBeDefined();
      expect(promise.reject).toBeDefined();
    });

    test('state changes', (done) => {
      const promise = new CircularPromise<void>(() => {});

      // eslint-disable-next-line no-void
      void promise.finally(() => {}).then(() => done());

      promise.resolve();
    });

    test('resolved with value', (done) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const promise = new CircularPromise<{}>(() => {});

      const expected = {};

      // eslint-disable-next-line no-void
      void promise.then((value) => expect(value).toBe(expected)).then(() => done());

      promise.resolve(expected);
    });

    test('rejected with value', (done) => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const promise = new CircularPromise<{}>(() => {});

      const expected = {};

      // eslint-disable-next-line no-void
      void promise.catch((value) => expect(value).toBe(expected)).then(() => done());

      promise.reject(expected);
    });
  });
});
