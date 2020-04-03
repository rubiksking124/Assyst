import RestController from './Rest';

export default class ClientBase {
    protected authKey: string | undefined;
    protected baseUrl: string;
    protected version: string | undefined;
    public controller!: RestController;
    public clientName: string;

    constructor (options: ClientOptions) {
      this.version = options.version;
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
    clientName: string,
    version?: string
}
