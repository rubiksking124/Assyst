import RestController from './Rest';

export default class ClientBase {
    private authKey: string | undefined;
    private baseUrl: string
    public controller!: RestController
    public clientName: string

    constructor (options: ClientOptions) {
      this.authKey = options.authKey;
      this.baseUrl = options.baseUrl;
      this.clientName = options.clientName;
    }

    public setController (controller: RestController): void {
      this.controller = controller;
    }
}

export interface ClientOptions {
    authKey?: string,
    baseUrl: string,
    clientName: string
}
