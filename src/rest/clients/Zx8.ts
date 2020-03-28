import ClientBase from '../ClientBase';

export default class Zx8RestClient extends ClientBase {
  constructor () {
    super({
      authKey: undefined,
      clientName: 'zx8',
      baseUrl: 'zx8.jacher.io'
    });
  }
}
