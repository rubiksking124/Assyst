import ClientBase from '../ClientBase';

export default class Zx8RestClient extends ClientBase {
  constructor () {
    super({
      authKey: undefined,
      clientName: 'zx8',
      baseUrl: 'zx8.jacher.io'
    });
  }

  public getAllHosts (): string[] { // Todo
    return [];
  }

  public searchHosts (query: string): any { // Todo
    return null;
  }

  public getHost (quary: string): any { // Todo
    return null;
  }
}
