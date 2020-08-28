import { CommandClient, Command } from 'detritus-client';
import { Message } from 'detritus-client/lib/structures';

import { BaseCommand } from './basecommand';
import { Assyst } from '../assyst';
import { BaseCollection } from 'detritus-client/lib/collections';

export class BaseFapiCommand extends BaseCommand {
  constructor (commandClient: CommandClient, options: Partial<Command.CommandOptions>) {
    super(commandClient, Object.assign({
      name: '',
      ratelimits: [
        { duration: 5000, limit: 5, type: 'guild' },
        { duration: 2000, limit: 1, type: 'channel' }
      ]
    }, options));
  }

  get fapi () {
    return (this.commandClient as Assyst).fapi;
  }

  public async getRecentAttachmentOrEmbed (msg: Message, amtOfMessages: number): Promise<string | undefined> {
    if (msg.attachments.length > 0) {
      return msg.attachments.first()?.url;
    }
    const messages: Array<Message> = await this.commandClient.rest.fetchMessages(msg.channelId, { limit: amtOfMessages });
    if (!messages) {
      return undefined;
    }
    let attachment: string | undefined;
    for (const message of messages) {
      if (message.attachments.length > 0) {
        // types broke
        // @ts-ignore
        return message.attachments[0].url;
      }
    }
    return attachment;
  }

  public async getUrlFromChannel (ctx: Command.Context, args?: string): Promise<string | undefined> {
    let imageUrl: string | undefined;
    if (args) {
      imageUrl = args;
      try {
        const parsedURL: URL = new URL(<string>imageUrl);
        imageUrl = parsedURL.origin + parsedURL.pathname + parsedURL.search;
      } catch (e) {
        return undefined;
      }
    } else {
      imageUrl = await this.getRecentAttachmentOrEmbed(ctx.message, 50);
    }
    return imageUrl;
  }
}
