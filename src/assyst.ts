import { CommandClient, CommandClientOptions, CommandClientRunOptions } from 'detritus-client';
import { Context, Command } from 'detritus-client/lib/command';

import { Client } from 'fapi-client';

import { tokens } from '../config.json';
import { RequestTypes } from 'detritus-client-rest';
import { Zx8 } from './rest/zx8';

export interface AssystOptions extends CommandClientOptions {
    directory: string
}

export class Assyst extends CommandClient {
    public directory: string
    public fapi: Client.Client
    public zx8: Zx8

    constructor (token: string, options: AssystOptions) {
      super(token, options);

      this.directory = options.directory;
      this.fapi = new Client.Client({
        auth: tokens.fapi
      });
      this.zx8 = new Zx8();

      // this.on('commandError', console.log);
      // this.on('commandFail', console.log);
    }

    executeLogWebhook (url: string, options?: string | RequestTypes.ExecuteWebhook) {
      const searchString = 'webhooks';

      const index = url.indexOf(searchString);
      if (index === -1) {
        throw new Error('Invalid Discord webhook URL provided');
      }

      const id = url.slice(index + searchString.length + 1, url.lastIndexOf('/'));
      const token = url.slice(url.lastIndexOf('/') + 1);

      return this.rest.executeWebhook(id, token, options);
    }

    async resetCommands () {
      this.clear();
      await this.addMultipleIn(this.directory, {
        subdirectories: true
      });
    }

    async run (options?: CommandClientRunOptions) {
      await this.resetCommands();
      return super.run(options);
    }

    async onCommandCheck (context: Context, command: Command) {
      if (context.user.isClientOwner) {
        return true;
      } else if (context.inDm || context.user.bot) {
        return false;
      }
      return true;
    }

    async onPrefixCheck () {
      return '...';
    }
}
