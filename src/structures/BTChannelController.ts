import { BaseCollection } from 'detritus-client/lib/collections';
import { Webhook, Message } from 'detritus-client/lib/structures';
import Assyst from './Assyst';

import { badTranslator } from '../../config.json';
import { ShardClient } from 'detritus-client';

type WebhookCollection = BaseCollection<string, Webhook>;

export default class BTChannelController {
    private channels: string[];
    private webhookCache: WebhookCollection;
    private ratelimitCache: BaseCollection<string, number>;
    private sentRatelimits: Set<string>;
    private _assyst: Assyst;

    constructor (assyst: Assyst, channels ?: string[]) {
      this._assyst = assyst;
      this.channels = channels || [];
      this.webhookCache = new BaseCollection({
        limit: 100
      });
      this.ratelimitCache = new BaseCollection({
        limit: 100
      });
      this.sentRatelimits = new Set();
    }

    public async init (): Promise<void> {
      // Init webhooks
      for (const channel of this.channels) {
        const webhook = await this.findWebhook(channel);
        if (webhook) {
          this.webhookCache.set(webhook.id, webhook);
        }
      }

      this._assyst.client.on('messageCreate', async ({
        message
      }) => {
        if (!this.channels.includes(message.channelId)) return;

        if ((message.author.bot && message.author.id !== (<ShardClient> this._assyst.client).user?.id) || !message.content) {
          if (message.author.isWebhook) return;
          return message.delete();
        } else if (message.author.id === (<ShardClient> this._assyst.client).user?.id) {
          return;
        }

        const userRatelimit = this.ratelimitCache.get(message.author.id);
        if (userRatelimit && Date.now() - userRatelimit < badTranslator.ratelimit) {
          const timeLeft = (userRatelimit + badTranslator.ratelimit) - Date.now();
          if (!message.deleted) await message.delete();

          let response: Message;
          if (!this.sentRatelimits.has(message.author.id)) {
            response = await message.reply(`${message.author.mention} try again in ${(timeLeft / 1000).toFixed(2)} seconds!`);
            this.sentRatelimits.add(message.author.id);
            setTimeout(() => response.delete(), 1500);
          }

          return;
        }

        this.sentRatelimits.delete(message.author.id);
        this.ratelimitCache.set(message.author.id, Date.now());
        await this.handle(message);
      });
    }

    public async handle (message: Message, attempt ?: number): Promise <void> {
      if (attempt && attempt > 5) {
        return;
      }

      const text = await this.translate(message.content, badTranslator.hops);
      const webhook = await this.getWebhookOrCreate(message.channelId);

      if (webhook) {
        try {
          await webhook.execute({
            allowedMentions: {
              parse: []
            },
            content: text.substr(0, 1999),
            avatarUrl: message.author.avatarUrlFormat('png'),
            username: message.author.username
          });
        } catch (e) {
          // Webhook no longer exists?
          this.webhookCache.delete(webhook.id);
          // Retry
          return this.handle(message, (attempt || 0) + 1);
        }
      }

      if (!message.deleted) await message.delete();
    }

    public async translate (text: string, hops ? : number): Promise<string> {
      // ONLY translate first 150 chars
      // Makes it harder to exceed daily limit, very easy to reach with constant 1k char translations
      return this._assyst.customRest.translate(text.substr(0, 150), hops || 6).then(r => r.text);
    }

    public async getWebhookOrCreate (channelId: string, attempt ?: number): Promise<Webhook | undefined> {
      if (attempt && attempt > 5) {
        return;
      }

      let webhook = this.webhookCache.find(w => w.channelId === channelId);
      if (!webhook) {
        webhook = await this.findWebhook(channelId);
        if (!webhook) {
          try {
            webhook = < Webhook > await this._assyst.rest.createWebhook(channelId, {
              name: 'BadTranslator'
            });
          } catch (e) {
            await this.deleteLRUWebhook(channelId);
            return this.getWebhookOrCreate(channelId, (attempt || 0) + 1);
          }
        }
        this.webhookCache.set(webhook.id, webhook);
      }

      return webhook;
    }

    public findWebhook (channelId: string): Promise <Webhook | undefined> {
      return this._assyst.rest.fetchChannelWebhooks(channelId)
        .then((webhooks: WebhookCollection) => webhooks.find(webhook => webhook.name === 'BadTranslator'));
    }

    public async deleteLRUWebhook (channelId: string): Promise<void> {
      await this._assyst.rest.fetchChannelWebhooks(channelId)
        .then((webhooks: WebhookCollection) => webhooks.first()?.delete());
    }
}
