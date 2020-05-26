import Assyst from './Assyst';
import { Webhook, Message } from 'detritus-client/lib/structures';
import { BaseCollection } from 'detritus-client/lib/collections';

import { badTranslator } from '../../config.json';

const Ratelimit = badTranslator.ratelimit; // allow one message every x seconds

export default class BTChannelController {
  private channels: string[];
  private webhookCache: BaseCollection<string, Webhook>;
  private ratelimitCache: BaseCollection<string, number>;
  private sentRatelimits: Set<string>;
  private _assyst: Assyst;

  constructor (assyst: Assyst, channels?: string[]) {
    this._assyst = assyst;
    this.channels = channels || [];
    this.webhookCache = new BaseCollection({ limit: 100 });
    this.ratelimitCache = new BaseCollection({ limit: 100 });
    this.sentRatelimits = new Set();
  }

  public async init (): Promise<void> {
    for (const channel of this.channels) {
      const webhooks: BaseCollection<string, Webhook> = await this._assyst.rest.fetchChannelWebhooks(channel);
      for (const webhook of webhooks.values()) {
        this.webhookCache.set(webhook.id, webhook);
      }
    }

    this._assyst.client.on('messageCreate', async ({ message }) => {
      if (!this.channels.includes(message.channelId)) return;

      if ((message.author.bot && !message.author.isWebhook && !message.author.isMe) || !message.content) {
        if (!message.deleted) return await message.delete();
      }

      const userRatelimit = this.ratelimitCache.get(message.author.id);
      if (userRatelimit && Date.now() - userRatelimit < Ratelimit) {
        const timeLeft = (userRatelimit + Ratelimit) - Date.now();
        if (!message.deleted) await message.delete();
        let response: Message;
        if (!this.sentRatelimits.has(message.author.id)) {
          response = await message.reply(`${message.author.mention} try again in ${(timeLeft / 1000).toFixed(2)} seconds!`);
          this.sentRatelimits.add(message.author.id);
        }
        setTimeout(() => response.delete(), 1500);
        return;
      }

      if (!message.author.isMe && !message.author.isWebhook) {
        this.sentRatelimits.delete(message.author.id);
        this.ratelimitCache.set(message.author.id, Date.now());
        await this.handle(message);
      }
    });
  }

  public async handle (message: Message, attempt?: number) {
    // prevent infinite recursion
    if (attempt && attempt > 5) {
      return;
    }
    const translatedText = await this.translate(message.content.substr(0, 1000), 3);
    const webhook = await this.getWebhookOrCreate(message.author.username, message.channelId);
    try {
      await this.executeWebhook(webhook!, translatedText, message.author.avatarUrlFormat('png'));
    } catch (e) {
      // Webhook no longer exists?
      this.webhookCache.delete(webhook!.id);
      // Retry
      await this.handle(message, (attempt || 0) + 1);
    }

    if (!message.deleted) await message.delete();
  }

  public async executeWebhook (webhook: Webhook, content: string, avatarUrl: string): Promise<void> {
    await webhook.execute({
      content: content.substr(0, 1999),
      avatarUrl,
      allowedMentions: {
        parse: []
      }
    });
  }

  public async translate (text: string, hops?: number): Promise<string> {
    // ONLY translate first 1000 chars
    // Yandex doesn't like >1k character translations (takes very long!)
    return this._assyst.customRest.translate(text.substr(0, 1000), hops || 6).then(r => r.text);
  }

  public async getWebhookOrCreate (username: string, channelId: string): Promise<Webhook | undefined> {
    let webhook = this.webhookCache.find(w => w.name === username && w.channelId === channelId);
    if (!webhook) {
      try {
        webhook = await this._assyst.client.rest.createWebhook(channelId, {
          name: username
        });
      } catch (e) {
        const lru = this.webhookCache.first();
        if (lru) {
          await this._assyst.rest.deleteWebhook(lru.id);
          this.webhookCache.delete(lru.id);
          webhook = await this._assyst.client.rest.createWebhook(channelId, {
            name: username
          });
        }
      }

      if (webhook) {
        this.webhookCache.set(webhook.id, webhook);
      }
    }

    return webhook;
  }
}
