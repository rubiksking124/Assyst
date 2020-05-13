import Assyst from './Assyst';

import { promisify } from 'util';
import { unlink, writeFile } from 'fs';

import { Message, ChannelGuildText } from 'detritus-client/lib/structures';

import { Context } from 'detritus-client/lib/command';

import { exec } from 'child_process';
import { Markup } from 'detritus-client/lib/utils';

const promisifyUnlink = promisify(unlink);
const promisifyWrite = promisify(writeFile);

export interface MetricItem {
  name: string,
  value: string
}

export interface MetricItemFormat {
  item: string,
  format: Function
}

interface ElapsedTime {
  seconds: number,
  minutes: number,
  hours: number,
  days: number
}

export default class Utils {
    private assyst: Assyst

    constructor (assyst: Assyst) {
      this.assyst = assyst;
    }

    public elapsed (value: number): ElapsedTime {
      const date: Date = new Date(value);
      const elapsed = { days: date.getUTCDate() - 1, hours: date.getUTCHours(), minutes: date.getUTCMinutes(), seconds: date.getUTCSeconds() };
      return elapsed;
    }

    public formatMetricList (items: MetricItem[], separatorValue: number = 15, formatItems?: MetricItemFormat[]): string {
      let longestVal = 0;
      items.forEach((item: MetricItem) => {
        if (item.name.length > longestVal) longestVal = item.name.length;
      });
      if (longestVal > separatorValue) separatorValue = longestVal;
      let returnString = '';
      items.forEach((i: MetricItem) => {
        if (!formatItems || !formatItems.map(i => i.item).includes(i.name)) {
          returnString += `${i.name} ${'-'.repeat(separatorValue - i.name.length)} ${i.value}\n`;
        } else {
          returnString += `${i.name} ${'-'.repeat(separatorValue - i.name.length)} ${formatItems.find(j => j.item === i.name)?.format(i.value)}\n`;
        }
      });
      return returnString;
    }

    public async getRecentAttachmentOrEmbed (message: Message, amtOfMessages: number): Promise<string | undefined> {
      if (message.attachments.length > 0) {
        return message.attachments.first()?.url;
      }
      const messages: Array<Message> = await this.assyst.rest.fetchMessages(message.channelId, { limit: amtOfMessages });
      if (!messages) {
        return undefined;
      }
      let attachment: string | undefined;
      messages.forEach(message => {
        if (message.attachments.first() !== undefined && attachment === undefined) {
          attachment = message.attachments.first()?.url;
        } else if (message.embeds.length > 0 && message.embeds.first()?.image && attachment === undefined) {
          attachment = message.embeds.first()?.image?.url;
        } else if (message.embeds.length > 0 && message.embeds.first()?.thumbnail && attachment === undefined) {
          attachment = message.embeds.first()?.thumbnail?.url;
        }
      });
      return attachment;
    }

    public async getUrlFromChannel (ctx: Context, args?: string): Promise<string | undefined> {
      let imageUrl: string | undefined;
      if (args) {
        imageUrl = args;
        try {
          const parsedURL: URL = new URL(<string>imageUrl);
          imageUrl = parsedURL.origin + parsedURL.pathname + parsedURL.search;
          console.log(imageUrl);
        } catch (e) {
          return undefined;
        }
      } else {
        imageUrl = await this.assyst.utils.getRecentAttachmentOrEmbed(ctx.message, 50);
      }
      return imageUrl;
    }

    public createExecStream (ctx: Context, args: string, timeout: number, stopDelay: number, after?: Function) {
      let sentData = '';
      const updateQueue: Array<string> = [];
      const stream = exec(args, { timeout });

      let dataRecieved = false;

      let timeOfLastNewData: number = Date.now();

      let timeoutExceeded = false;

      let running: boolean = true;

      const updateInterval = setInterval(async () => {
        if (timeoutExceeded) return;
        const newData = updateQueue.shift();
        if (!newData) {
          if (stopDelay < Date.now() - timeOfLastNewData && running) {
            await ctx.editOrReply(Markup.codeblock(sentData + `\nNo new data recieved in last ${stopDelay}ms, listener killed`, { limit: 1990 }));
            running = false;
            return handleStreamEnd();
          } else return;
        } else {
          timeOfLastNewData = Date.now();
        }
        sentData += newData;
        await ctx.editOrReply(Markup.codeblock(sentData, { limit: 1990 }));
        if (updateQueue.length === 0 && !running) {
          handleStreamEnd();
        }
      }, 1000);

      function clearUpdateInterval () {
        clearInterval(updateInterval);
      }

      function handleStreamEnd () {
        stream.kill();
        if (after) after();
        clearUpdateInterval();
        clearTimeout(limitTimer);
      }

      const limitTimer = setTimeout(async () => {
        running = false;
        stream.kill();
        if (updateQueue.length > 0) {
          await ctx.editOrReply(Markup.codeblock(`${sentData}\nTIMEOUT`, { limit: 1990 }));
          timeoutExceeded = true;
        }
        return handleStreamEnd();
      }, timeout);

      if (stream.stdout === null || stream.stderr === null) {
        return handleStreamEnd();
      };

      stream.stdout.on('data', async (data) => {
        updateQueue.push(String(data));
        dataRecieved = true;
      });

      stream.stderr.on('data', async (data) => {
        updateQueue.push(String(data));
        dataRecieved = true;
      });

      stream.on('close', async () => {
        if (!dataRecieved) {
          await ctx.editOrReply(Markup.codeblock('No data was recieved', { limit: 1990 }));
        }
        running = false;
      });

      stream.on('error', (error) => {
        ctx.editOrReply(error.message);
        return handleStreamEnd();
      });
    }

  /* public async uploadToFilesGG (text: string, filename: string): Promise<string> { // TODO: fix this
      const fd = new FormData();
      fd.append('file', createReadStream(`${__dirname}/${filename}`));

      fetch('https://api.files.gg/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: fd
      });
    } */
}
