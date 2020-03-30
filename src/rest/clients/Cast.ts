import ClientBase from '../ClientBase';

export default class CastRestClient extends ClientBase {
  constructor () {
    super({
      authKey: undefined,
      clientName: 'cast',
      baseUrl: 'assyst.axonteam.org/api/parse'
    });
  }

  public parseQuery (query: string, args: string[], tag: string): string { // Todo
    return '';
  }
}
