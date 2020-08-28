import { Message } from 'detritus-client/lib/structures';
import { Command, CommandClient } from 'detritus-client';
import { Response } from 'detritus-rest';

import { Assyst } from '../assyst';

import { logWebhooks } from '../../config.json';
import { EmbedColors } from '../constants';

export interface CommandMetadata {
    description?: string,
    examples?: string[],
    usage?: string
}

export class BaseCommand extends Command.Command {
    metadata!: CommandMetadata;

    responseOptional = true;

    constructor (commandClient: CommandClient, options: Partial<Command.CommandOptions>) {
      super(commandClient, Object.assign({
        name: '',
        ratelimits: [
          { duration: 5000, limit: 5, type: 'guild' },
          { duration: 1000, limit: 1, type: 'channel' }
        ]
      }, options));
    }

    onBefore (context: Command.Context): boolean {
      const oldEditOrReply: ((options: Command.EditOrReply | string) => Promise<Message>) = context.editOrReply.bind(context);

      context.editOrReply = (options?: string | Command.EditOrReply) => {
        if (typeof options === 'string') {
          return oldEditOrReply({
            content: options,
            allowedMentions: {
              parse: []
            }
          });
        } else {
          return oldEditOrReply({
            ...options,
            allowedMentions: {
              parse: []
            }
          });
        }
      };

      return true;
    }

    async onRunError (context: Command.Context, _: any, error: any) {
      const commandClient = context.commandClient as Assyst;

      console.log(error);

      const description: string[] = [error.message || error.stack];

      if (error.response) {
        const response: Response = error.response;
        try {
          const information = await response.json() as any;
          if ('errors' in information) {
            for (const key in information.errors) {
              const value = information.errors[key];
              let message: string;
              if (typeof (value) === 'object') {
                message = JSON.stringify(value);
              } else {
                message = String(value);
              }
              description.push(`**${key}**: ${message}`);
            }
          }
        } catch (e) {
          description.push(await response.text());
        }
      }

      commandClient.executeLogWebhook(logWebhooks.commandErrors, {
        embed: {
          color: EmbedColors.ERROR,
          description: description.join('\n'),
          fields: [
            {
              name: 'Command',
              value: context.command?.name || '',
              inline: true
            }
          ],
          title: '⚠️ Command Error'
        }
      });
    }
}
