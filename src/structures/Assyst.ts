import { CommandClient } from 'detritus-client';

import { Pool, QueryResult } from 'pg';

import { readdirSync } from 'fs';

import {
  token,
  db,
  commandClientOptions,
  webhooks
} from '../../config.json';
import RestController from '../rest/Rest';
import Logger from './Logger';
import { Context, ParsedArgs } from 'detritus-client/lib/command';
import { Markup } from 'detritus-client/lib/utils';

export default class Assyst {
    public commandClient: CommandClient;
    public db: Pool
    public rest: RestController
    public logger: Logger

    constructor () {
      this.commandClient = new CommandClient(token, commandClientOptions);
      this.db = new Pool(db);
      this.rest = new RestController(this);
      this.logger = new Logger();
      this.loadCommands();
    }

    public sql (query: string, values?: any[]): Promise<QueryResult> {
      return new Promise((resolve, reject) => {
        this.db.query(query, values || [], (err: any, res: any) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    }

    private loadCommands () {
      const files = readdirSync('./src/commands');
      files.forEach(async (file: string) => {
        const command: any = await import(`../commands/${file}`).then((v: any) => v.default);
        this.commandClient.add({
          ...command,

          run: command.run.bind(null, this),

          onRunError: (ctx: Context, _args: any, error: any) => {
            ctx.editOrReply(Markup.codeblock(`Error: ${error.message}`, { language: 'js', limit: 1990 }));
            this.fireErrorWebhook(webhooks.commandOnError.id, webhooks.commandOnError.token, 'Command Run Error Fired', 0xDD5522, error);
          },

          onError: (_ctx: Context, _args: any, error: any) => { this.fireErrorWebhook(webhooks.commandOnError.id, webhooks.commandOnError.token, 'Command Error Fired', 0xBBAA00, error); }
        });
        this.logger.info(`Loaded command: ${command.name}`);
      });
    }

    public fireErrorWebhook (id: string, token: string, title: string, color: number, error: any): void {
      this.commandClient.client.rest.executeWebhook(id, token, {
        embed: {
          title,
          color,
          description: error.message,
          fields: [
            {
              name: 'Stack',
              value: `\`\`\`js\n${error.stack}\`\`\``,
              inline: false
            }
          ]
        }
      });
    }

    get cc () {
      return this.commandClient; // bc im lazy as hell
    }
}
