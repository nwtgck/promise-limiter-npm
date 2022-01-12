export class PromiseLimiter {
  private release?: () => void;

  constructor(private n: number) { }

  public run<T>(asyncFunc: () => Promise<T>): Promise<{promise: Promise<T>}> {
    if (this.n === 0) {
      return new Promise((resolve) => {
        this.release = () => {
          this.n--;
          const promise = asyncFunc();
          promise.then(
            () => this.doRelease(),
            () => this.doRelease()
          );
          resolve({promise});
        };
      });
    } else {
      this.n--;
      const promise = asyncFunc();
      promise.then(
        () => this.doRelease(),
        () => this.doRelease()
      );
      return Promise.resolve({promise});
    }
  }

  private doRelease(): void {
    this.n++;
    if (this.release !== undefined) {
      this.release();
      delete this.release;
    }
  }
}
