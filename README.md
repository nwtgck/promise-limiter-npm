# promise-limiter
[![CircleCI](https://circleci.com/gh/nwtgck/promise-limiter-npm.svg?style=shield)](https://circleci.com/gh/nwtgck/promise-limiter-npm)

Simultaneous Promise Execution Limiter

## Motivation
`PromiseLimiter` takes **less memory resource**. `PromiseLimiter` does not use a queue of `Promise` to restrict the number of executions.
`PromiseLimiter` uses `await` to block rest of promises. So it takes less memory even if the length of the array bellow is large or using infinite [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream). 

## Installation

Install by npm from this GitHub repository

```bash
npm install -S git+https://github.com/nwtgck/promise-limiter-npm#v0.1.0
```

## Usage

Here is an usage.

```js
const promiseLimiter = new PromiseLimiter(3);
for(const millis of [800, 100, 500, 200, 1000, 400]) {
  const {promise} = await promiseLimiter.run(async () => {
    console.log(`Start: ${millis}`);
    // Sleep for millis
    await new Promise(resolve => setTimeout(resolve, millis));
    console.log(`  Finish: ${millis}`);
    return `Result: ${millis}`;
  });
}
```

Console log is the following.

```txt
Start: 800
Start: 100
Start: 500
  Finish: 100
Start: 200
  Finish: 200
Start: 1000
  Finish: 500
Start: 400
  Finish: 800
  Finish: 400
  Finish: 1000
```

You can use `promise` in `const {promise} = ...` to get fulfilled result of `async () => {...}` in `run()`.
