import {PromiseLimiter}  from '../src';
import * as assert from 'power-assert';

type Tag = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

function sleep(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

describe('PromiseLimiter', () => {
  it('should limit the number of promise', async () => {
    // Tag and millis
    const tagAndMillisArr: [Tag, number][] = [
      ['A', 800],
      ['B', 100],
      ['C', 500],
      ['D', 200],
      ['E', 1000],
      ['F', 400]
    ];

    // Create a promise limiter
    const promiseLimiter = new PromiseLimiter(3);

    // Start order
    const startOrder: Tag[] = [];
    // End order
    const endOrder: Tag[]   = [];

    // Promise array
    const promises: Promise<Tag>[] = [];

    for(const [tag, millis] of tagAndMillisArr) {
      // Execute
      const {promise} = await promiseLimiter.run(async () => {
        // Push as "start"
        startOrder.push(tag);
        // Sleep
        await sleep(millis);
        // Push as "end"
        endOrder.push(tag);
        // Return tag as computation result
        return tag
      });
      // Push promise
      promises.push(promise);
    }

    // Total finish time is 1300 calculate by hand
    await sleep(1500);

    // Start order should be array order
    assert.deepStrictEqual(startOrder, ['A', 'B', 'C', 'D', 'E', 'F']);
    // End order
    assert.deepStrictEqual(endOrder, ['B', 'D', 'C', 'A', 'F', 'E']);
    // All promise result
    assert.deepStrictEqual(await Promise.all(promises), ['A', 'B', 'C', 'D', 'E', 'F']);
  });
});
