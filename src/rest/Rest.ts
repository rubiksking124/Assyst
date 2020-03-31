import { readdirSync } from 'fs';
import ClientBase from './ClientBase';
import Assyst from '../structures/Assyst';
import { RequestTypes } from 'detritus-client-rest';

export default class RestController {
    public clients: Map<string, ClientBase>
    public assyst: Assyst

    constructor (assyst: Assyst) {
      this.assyst = assyst;
      this.clients = new Map();
      this.loadClients();
    }

    private loadClients () {
      const files = readdirSync('./src/rest/clients');
      files.forEach(async (file: string) => {
        const ClientImport: any = await import(`./clients/${file}`).then((m: any) => m.default);
        const client: ClientBase = new ClientImport();
        client.setController(this);
        this.clients.set(client.clientName, client);
        this.assyst.logger.info(`Loaded REST client: ${client.clientName}`);
      });
    }

    public async request (options: RequestTypes.RequestOptions) {
      return await this.assyst.client.rest.request(options);
    }
}
