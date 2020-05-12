import { CommandClient, CommandClientOptions, Command, ShardClient } from 'detritus-client';

import Utils from './Utils';

import Database, { ITag } from './Database';

import Parser from './Parser';

import { Message } from 'detritus-client/lib/structures';

import { readdirSync } from 'fs';

import {
  db,
  webhooks,
  prefixOverride,
  limitToUsers,
  logErrors,
  doPostToBotLists
} from '../../config.json';
import RestController from '../rest/Rest';
import Logger from './Logger';
import { Context } from 'detritus-client/lib/command';
import { Markup } from 'detritus-client/lib/utils';
import AssystApi from '../api/Api';
import { BaseCollection, BaseSet } from 'detritus-client/lib/collections';

interface Field {
  name: string,
  value: string,
  inline?: boolean
}

interface Metrics {
  eventRate: number,
  commands: number
}

export interface Metric {
  name: string,
  value: number
}

export default class Assyst extends CommandClient {
    public db: Database
    public customRest: RestController
    public logger: Logger
    public api: AssystApi
    public utils: Utils
    public metrics!: Metrics

    public logErrors: boolean

    public prefixCache: BaseCollection<string, string>

    private metricsInterval!: NodeJS.Timeout

    constructor (token: string, options: CommandClientOptions) {
      super(token || '', options);
      this.logErrors = logErrors === undefined ? true : logErrors;
      this.db = new Database(this, db);
      this.customRest = new RestController(this);
      this.logger = new Logger();
      this.api = new AssystApi(this);
      this.utils = new Utils(this);
      this.prefixCache = new BaseCollection({
        expire: 3600000
      });
      this.on('commandDelete', ({ reply }) => {
        reply.delete();
      });
      (<ShardClient> this.client).messages.limit = 100;
      this.initMetricsChecks();
      this.loadCommands();
      if (doPostToBotLists) this.initBotListPosting();
    }

    private loadCommands (noLog?: boolean) {
      const folders = readdirSync('./src/commands');
      folders.forEach(async (folder: string) => {
        if (folder.includes('template')) return;
        if (folder.includes('.js')) throw new Error('Commands must be within subfolders for their category');
        const files = readdirSync(`./src/commands/${folder}`);
        files.forEach(async (file) => {
          if (file.includes('template') || file.includes('category_info')) return;
          const command: any = await import(`../commands/${folder}/${file}`).then((v: any) => v.default);
          this.add({
            ...command,

            metadata: {
              ...command.metadata,
              category: folder
            },

            disableDm: true,

            run: command.run.bind(null, this),

            onRatelimit: (ctx: Context, ratelimits: any[]) => {
              if (ratelimits[0].item.replied === false) {
                ctx.editOrReply(`Cooldown - you need to wait ${(ratelimits[0].remaining / 1000).toFixed(2)} seconds.`);
                ratelimits[0].item.replied = true;
              }
            },

            onRunError: (ctx: Context, args: any, error: any) => {
              if (error.message.includes(db.host)) {
                ctx.editOrReply('An unexpected error occurred during execution...');
              } else {
                ctx.editOrReply(Markup.codeblock(`Error: ${error.message}`, { language: 'js', limit: 1990 }));
              }
              this.fireErrorWebhook(webhooks.commandOnError.id, webhooks.commandOnError.token, 'Command Run Error Fired', 0xDD5522, error, [
                {
                  name: 'Command',
                  value: command.name,
                  inline: true
                },
                {
                  name: 'Args',
                  value: args[command.name] || 'None',
                  inline: true
                },
                {
                  name: 'Guild',
                  value: ctx.guildId || 'None',
                  inline: false
                }
              ]);
            },

            onError: (ctx: Context, _args: any, error: any) => {
              ctx.editOrReply(Markup.codeblock(`Error: ${error.message}`, { language: 'js', limit: 1990 }));
              this.fireErrorWebhook(webhooks.commandOnError.id, webhooks.commandOnError.token, 'Command Error Fired', 0xBBAA00, error);
            },

            onTypeError: (ctx: Context, _args: any, error: any) => {
              ctx.editOrReply(Markup.codeblock(`Error: ${error.message}`, { language: 'js', limit: 1990 }));
              this.fireErrorWebhook(webhooks.commandOnError.id, webhooks.commandOnError.token, 'Command Type Error Fired', 0xCC2288, error);
            },

            onSuccess: async (ctx: Context) => await this.db.updateCommandUsage(ctx)
          });
          if (!noLog) this.logger.info(`Loaded command: ${command.name}`);
        });
      });
    }

    public reloadCommands () {
      const folders = readdirSync('./src/commands');
      folders.forEach(async (folder: string) => {
        if (folder.includes('template')) return;
        if (folder.includes('.js')) throw new Error('Commands must be within subfolders for their category');
        const files = readdirSync(`./src/commands/${folder}`);
        files.forEach(async (file) => {
          if (file.includes('template') || file.includes('category_info')) {} else {
            delete require.cache[require.resolve(`../commands/${folder}/${file}`)];
          }
        });
      });
      this.clear();
      this.loadCommands(true);
    }

    public fireErrorWebhook (id: string, token: string, title: string, color: number, error: any, extraFields: Field[] = []): void {
      if (!this.logErrors) return;
      this.client.rest.executeWebhook(id, token, {
        embed: {
          title,
          color,
          description: error.message,
          fields: [
            {
              name: 'Stack',
              value: `\`\`\`js\n${error.stack}\`\`\``,
              inline: false
            },
            ...extraFields
          ]
        }
      });
    }

    public async onPrefixCheck (ctx: Context) {
      if (!ctx.user.bot && ctx.guildId && prefixOverride.enabled === false) {
        let prefix = this.prefixCache.get(ctx.guildId);
        if (!prefix) {
          prefix = await this.db.getGuildPrefix(ctx.guildId);
          if (!prefix) {
            await this.db.addGuildPrefix(ctx.guildId, 'a-');
            prefix = 'a-';
          }
        }
        return new BaseSet([prefix, `${ctx.client.user?.mention} `, `<@!${ctx.client.user?.id}> `]);
      }
      if (prefixOverride.enabled === false) return '';
      else return prefixOverride.prefix;
    }

    private async initMetricsChecks (): Promise<void> {
      const metrics = await this.db.getMetrics();
      const commands = metrics.find((m: Metric) => m.name === 'commands')?.value;
      const eventRate = metrics.find((m: Metric) => m.name === 'last_event_count')?.value;
      if (!commands || !eventRate) {
        throw new Error('Metrics are missing from the table');
      }
      let eventsThisMinute: number = 0;
      this.metrics = {
        commands,
        eventRate
      };
      this.client.on('raw', () => {
        eventsThisMinute++;
      });
      this.metricsInterval = setInterval(() => {
        this.metrics.eventRate = eventsThisMinute;
        eventsThisMinute = 0;
        this.db.updateMetrics(this.metrics.commands, this.metrics.eventRate);
      }, 60000);
      this.logger.info('Initialised metrics checks');
    }

    private async initBotListPosting (): Promise<void> {
      setInterval(async () => {
        await this.customRest.postStats();
      }, 60000);
    }

    public async onCommandCheck (ctx: Context, command: Command.Command): Promise<boolean> {
      return this.checkBotUseLimit(ctx) && await this.checkIfDisabled(ctx, command);
    }

    private async checkIfDisabled (ctx: Context, command: Command.Command): Promise<boolean> {
      const disabledGuildCommands = await this.db.getGuildDisabledCommands(<string> ctx.guildId);
      if (disabledGuildCommands.includes(command.name)) return false;
      else return true;
    }

    private checkBotUseLimit (ctx: Context): boolean {
      if (ctx.inDm || ctx.user.bot) return false;
      if (limitToUsers.enabled && limitToUsers.users.includes(ctx.userId)) return true;
      else if (!limitToUsers.enabled) return true;
      else return false;
    }

    public parseNew (input: string, message: Message, args: string[] = [], tag: ITag) {
      return new Parser(<ShardClient> this.client, {
        message,
        getMemberFromString: () => null
      }, this).parse(input, args, tag);
    }
}
