import { CommandClient, CommandClientOptions, Command, ShardClient } from 'detritus-client';

import Utils from './Utils';

import Database, { ITag } from './Database';

import Parser from './Parser';

import { inspect } from 'util';

import { Message } from 'detritus-client/lib/structures';

import { readdirSync } from 'fs';

import {
  db,
  webhooks,
  prefixOverride,
  limitToUsers,
  logErrors,
  doPostToBotLists,
  logGateway,
  badTranslator,
  guildBlacklist
} from '../../config.json';
import RestController from '../rest/RestController';
import Logger from './Logger';
import { Context } from 'detritus-client/lib/command';
import { Markup } from 'detritus-client/lib/utils';
import AssystApi from '../api/AssystApi';
import { BaseCollection, BaseSet } from 'detritus-client/lib/collections';

import { Paginator } from 'detritus-pagination';
import TraceController from './TraceController';
import Trace from './Trace';

import MessageSnipe from './MessageSnipe';
import MessageSnipeController from './MessageSnipeController';
import BTChannelController from './BTChannelController';

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
  public traceHandler: TraceController

  public paginator: any

  public startedAt!: Date

  public logErrors: boolean

  public prefixCache: BaseCollection<string, string>

  public messageSnipeController: MessageSnipeController

  public btChannelController?: BTChannelController

  constructor (token: string, options: CommandClientOptions) {
    super(token || '', options);

    if (badTranslator.channels[0].length > 0) this.btChannelController = new BTChannelController(this, badTranslator.channels);
    this.messageSnipeController = new MessageSnipeController(this);
    this.traceHandler = new TraceController(this);
    this.logErrors = logErrors === undefined ? true : logErrors;
    this.db = new Database(this, db);
    this.customRest = new RestController(this);
    this.logger = new Logger();
    this.api = new AssystApi(this);
    this.utils = new Utils(this);
    this.prefixCache = new BaseCollection({
      expire: 3600000
    });

    (<ShardClient> this.client).messages.limit = 100;

    this.paginator = new Paginator(this.client, {
      maxTime: 60000,
      pageLoop: true,
      pageNumber: true
    });

    this.initMetricsChecks();
    this.loadCommands();
    this.registerEvents();
    if (this.btChannelController) this.btChannelController.init();
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

        const commandOptions: Command.Command<any> = {
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
            this.handleTraceAddition(ctx, args, error);
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

          onError: (ctx: Context, args: any, error: any) => {
            this.handleTraceAddition(ctx, args, error);
            this.fireErrorWebhook(webhooks.commandOnError.id, webhooks.commandOnError.token, 'Command Error Fired', 0xBBAA00, error);
          },

          onTypeError: (ctx: Context, args: any, error: any) => {
            this.handleTraceAddition(ctx, args, error);
            this.fireErrorWebhook(webhooks.commandOnError.id, webhooks.commandOnError.token, 'Command Type Error Fired', 0xCC2288, error);
          },

          onSuccess: async (ctx: Context) => await this.db.updateCommandUsage(ctx),

          _file: file
        };

        if (command.onBefore !== undefined) {
          commandOptions.onBefore = command.onBefore.bind(null, this);
        }

        this.add(commandOptions);
        if (!noLog) this.logger.info(`Loaded command: ${command.name}`);
      });
    });
  }

  private registerEvents (): void {
    this.client.on('guildCreate', async (event) => {
      if (guildBlacklist.includes(event.guild.id)) {
        await event.guild.leave();
      }
    });

    this.on('commandNone', () => {
      const messages = (<ShardClient> this.client).messages;
      if (messages.size > 1000) {
        const difference = messages.size - 1000;
        for (let i = 0; i < difference; i++) {
          const firstEntry = Array.from(messages)[0];
          messages.delete(firstEntry[0]);
        }
      }
    });

    this.on('commandDelete', ({ reply }) => { reply.delete(); });

    this.client.on('messageDelete', async (message) => {
      if (!message.message) return;
      const snipe = new MessageSnipe(message.message, new Date(), this);
      await snipe.fetchChannel();
      this.messageSnipeController.addSnipe(message.message?.id, snipe);
    });

    this.initGatewayEventHandlers();
  }

  private handleTraceAddition (ctx: Context, args: any, error: any) {
    const id = TraceController.generateId();
    this.traceHandler.addTrace(id, new Trace({ error, args, context: ctx, thrownAt: new Date() }));
    ctx.editOrReply(`An error occurred, to report this error please join the support server (with ${ctx.prefix}invite) and quote the error id \`${id}\``);
  }

  public reloadCommands () {
    const folders = readdirSync('./src/commands');
    folders.forEach(async (folder: string) => {
      if (folder.includes('template')) return;
      if (folder.includes('.js')) throw new Error('Commands must be within subfolders for their category');
      const files = readdirSync(`./src/commands/${folder}`);
      files.forEach(async (file) => {
        if (!file.includes('template') && !file.includes('category_info')) {
          delete require.cache[require.resolve(`../commands/${folder}/${file}`)];
        }
      });
    });
    this.clear();
    this.loadCommands(true);
  }

  public fireErrorWebhook (id: string, token: string, title: string, color: number, error: any, extraFields: Field[] = []): void {
    if (!this.logErrors) return;
    if (error.errors) {
      extraFields.push({
        name: 'Errors',
        value: Markup.codeblock(inspect(error.errors, { depth: 9, showHidden: true }))
      });
    }
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

  public initGatewayEventHandlers () {
    (<ShardClient> this.client).gateway.on('open', () => {
      this.client.emit('raw', { t: 'GATEWAY_OPEN' });
      this.startedAt = new Date();
      if (logGateway) {
        this.client.rest.executeWebhook(webhooks.gatewayOpen.id, webhooks.gatewayOpen.token, {
          embed: {
            title: 'Gateway Opened',
            description: `Opened at ${new Date().toLocaleString()}`,
            color: 0x33FF33
          }
        });
      }
    });

    (<ShardClient> this.client).gateway.on('close', ({ code, reason }) => {
      this.client.emit('raw', { t: 'GATEWAY_CLOSE' });
      if (logGateway) {
        this.client.rest.executeWebhook(webhooks.gatewayClose.id, webhooks.gatewayClose.token, {
          embed: {
            title: 'Gateway Closed',
            description: `Closed at ${new Date().toLocaleString()}`,
            fields: [
              {
                name: 'Code',
                value: code.toString(),
                inline: true
              },
              {
                name: 'Reason',
                value: reason,
                inline: true
              }
            ],
            color: 0xe35502
          }
        });
      }
    });

    if (logGateway) {
      (<ShardClient> this.client).gateway.on('ready', () => {
        this.client.rest.executeWebhook(webhooks.gatewayKilled.id, webhooks.gatewayKilled.token, {
          embed: {
            title: 'Gateway Ready',
            description: `Readied at ${new Date().toLocaleString()}`,
            color: 0x09e06e
          }
        });
      });
    }
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
    const events: Map<string, number> = new Map();
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
    this.client.on('raw', (packet) => {
      const eventCount = events.get(packet.t) || 0;
      events.set(packet.t, eventCount + 1);
      eventsThisMinute++;
    });
    setInterval(async () => {
      this.metrics.eventRate = eventsThisMinute;
      eventsThisMinute = 0;
      await this.db.updateMetrics(this.metrics.commands, this.metrics.eventRate);
      await this.db.updateEventCounts(events);
      events.clear();
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
    const disabledGuildCommands = await this.db.getGuildDisabledCommands(<string>ctx.guildId);
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

  public findCommand (name: string) {
    return this.commands.find(c => c.name === name || c.aliases.includes(name));
  }
}
