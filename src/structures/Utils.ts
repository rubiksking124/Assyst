import Assyst from './Assyst';

import { gocode } from '../../config.json';

import { promisify } from 'util';
import { unlink, writeFile } from 'fs';

import { Message } from 'detritus-client/lib/structures';

import { Context } from 'detritus-client/lib/command';

import { Request } from 'detritus-rest';

import FormData from 'form-data';

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
      if (!message.channel) {
        return undefined;
      } else if (message.attachments.length > 0) {
        return message.attachments.first()?.url;
      }
      const messages: Array<Message> = await message.channel?.fetchMessages({ limit: amtOfMessages });
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
          imageUrl = parsedURL.origin + parsedURL.pathname;
        } catch (e) {
          return undefined;
        }
      } else {
        imageUrl = await this.assyst.utils.getRecentAttachmentOrEmbed(ctx.message, 50);
      }
      return imageUrl;
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
