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

  it('should not fail when async function in .run() failed', async () => {
    const promiseLimiter = new PromiseLimiter(3);

    const promises: Promise<number>[] = [];
    for (let i = 0; i < 5; i++) {
      // Execute
      const {promise} = await promiseLimiter.run(async () => {
        if (i % 2 == 1) throw new Error(`on-purpose error: ${i}`);
        return i;
      });
      // Push promise
      promises.push(promise);
    }

    assert.strictEqual(promises.length, 5);
    assert.strictEqual(await promises[0], 0);
    assert.strictEqual(await promises[1].catch(e => e.message), `on-purpose error: 1`);
    assert.strictEqual(await promises[2], 2);
    assert.strictEqual(await promises[3].catch(e => e.message), `on-purpose error: 3`);
    assert.strictEqual(await promises[4], 4);
  });
});
