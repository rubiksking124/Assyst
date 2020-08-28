import Assyst from '../structures/Assyst';

import { IncomingMessage, ServerResponse } from 'http';

import { api } from '../../config.json';

const polka = require('polka');

type Request = IncomingMessage & {
    params: any,
    path: any,
    search: any,
    query: any
};

export default class AssystApi {
    public assyst: Assyst

    constructor (assyst: Assyst) {
      this.assyst = assyst;
      polka()
        .get('/commands', (req: Request, res: ServerResponse) => {
          if (req.query.raw || req.query.raw === '') {
            res.end(this.getRawCommands());
          } else {
            res.end(this.getFormattedCommands());
          }
        })
        .listen(api.port);
      this.assyst.logger.info('Initialised API');
    }

    private getRawCommands (): string {
      return JSON.stringify(this.assyst.commands);
    }

    private getFormattedCommands (): string {
      return this.assyst.commands.filter((c) => !c.onBefore).map((c) => `${c.name} - ${c.metadata.description}`).join('\n\n');
    }
}
