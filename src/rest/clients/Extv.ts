import ClientBase from '../ClientBase';

export default class ExtvRestClient extends ClientBase {
  constructor () {
    super({
      authKey: undefined,
      clientName: 'extv',
      baseUrl: 'assyst.axonteam.org/api/parse'
    });
  }

  public uploadText (text: string, filename: string): string { // Todo
    return '';
  }

  public getText (filename: string): string { // Todo
    return '';
  }
}
