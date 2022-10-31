// eslint-disable-next-line @typescript-eslint/no-var-requires
const addon = require('../../build/Release/request-router-native');

interface IRequestRouterNative {
  greet(): string;
}

export class RequestRouter {
  constructor(name: string) {
    this.instance = new addon.RequestRouter(name);
  }

  greet() {
    return this.instance.greet();
  }

  // private members
  private instance: IRequestRouterNative;
}
