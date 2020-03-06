import { ShardClient, Utils } from 'detritus-client';
import { IAssystOptions } from './CInterfaces';
import { ISendMsgOptions, ICommandResponse, ITag, IMetrics } from './Interfaces';
import Command from './Command';
import AssystUtils from './Utils';
import Handler from './Handler';
import Resolver from './Resolver';
import { readdirSync } from 'fs';
import { Context } from 'detritus-client/lib/command';
import { ChannelGuildText, Message } from 'detritus-client/lib/structures';
import { MESSAGE_TYPE_EMOTES, REQUEST_TYPES } from './Enums';
import CooldownManager from './CooldownManager';
import superagent from 'superagent';
import { Pool, QueryResult } from 'pg';
import { db } from '../privateConfig.json';
import Parser from './Parser';
import { BaseCollection } from 'detritus-client/lib/collections';
import Config from './Config';
import Trace from './Trace';

const { Paginator } = require('detritus-pagination'); // TODO: any because I fucked up typings lol, will fix soon
const { Markup } = Utils;

export default class Assyst {

    public devOnly: boolean
    public bot: ShardClient;
    public utils: AssystUtils;
    public commands: Map<string, Command>;
    public handler: Handler;
    public resolver: Resolver;
    public cooldownManager: CooldownManager;
    public db: Pool;
    public responseMessages: Map<string, Array<ICommandResponse>>
    public paginator: any; // todo: typings
    public reactions: any; // ^
    public caches: {
        prefixes: BaseCollection<string, string>,
        disabledCommands: BaseCollection<string, boolean>
    }
    public config: Config
    public traces: Trace[]
    public metrics: IMetrics

    constructor(options: IAssystOptions) {
        this.devOnly = false;

        this.bot = options.bot || new ShardClient(options.config.tokens.bot, {
            cache: {
                emojis: { enabled: false },
                voiceCalls: { enabled: false },
                voiceConnections: { enabled: false },
                voiceStates: { enabled: false },
                presences: { enabled: false },
                sessions: { enabled: false },
                applications: { enabled: false },
                notes: { enabled: false },
                connectedAccounts: { enabled: false },
                typings: { enabled: false },
                users: { enabled: false },
            },
            gateway: {
                identifyProperties: {
                    $browser: 'Discord iOS'
                },
            },
        });

        this.metrics = {
            eventRate: 0,
            commands: 0
        };
        this.utils = new AssystUtils(this);
        this.commands = new Map();
        this.responseMessages = new Map();
        this.handler = new Handler(this);
        this.resolver = new Resolver(this);
        this.traces = [];

        this.caches = {
            prefixes: new BaseCollection({
                expire: options.config.prefixCacheExpire
            }),
            disabledCommands: new BaseCollection({
                expire: 86400000
            })
        };
        
        this.config = options.config;

        this.cooldownManager = new CooldownManager();

        this.paginator = new Paginator(this.bot, {
            maxTime: options.config.paginatorTimeout,
            pageLoop: true
        });

        this.db = new Pool({
            port: 5432,
            user: 'assyst',
            database: 'assyst',
            host: db.host,
            password: db.password
        });

        this.loadCommands()
            .then((c: Map<string, Command>) => {
                console.log(`Loaded ${c.size} commands`);
            });

        this.initEventCounter();
        this.initStatusRota();
        this.initListeners();
    }

    private async loadCommands(): Promise<Map<string, Command>> {
        const files = readdirSync('./src/commands').filter((f: string) => f.endsWith('.js') && !f.includes('template'));

        for (const file of files) {
            const command: any = await import(`../src/commands/${file}`).then((m: any) => m.default);
            const instance: Command = new command(this);
            this.commands.set(instance.name.toLowerCase(), instance);
            console.log(`Loaded command: ${command.name}`);
        }

        return this.commands;
    }

    /* private async initMee6RoleCheckInterval(): Promise<void> {
        const roleRewardInfo = <[{
            guild: string,
            role: string,
            level: number
        }]>await this.sql('select * from mee6_role_rewards').then((r: QueryResult) => r.rows);
        roleRewardInfo.forEach(row => {
            
        });
    } */

    private initEventCounter(): void {
        let currentEventsInInterval: number = 0;
        this.bot.on('raw', () => {
            currentEventsInInterval++;
        });
        setInterval(() => {
            this.metrics.eventRate = currentEventsInInterval;
            currentEventsInInterval = 0;
        }, 1000);
    }

    private initListeners(): void {
        this.bot.on('messageCreate', (context: Context) => {
            this.handler.handleMessage(context.message);
        });
        this.bot.on('messageUpdate', (context: any) => {
            if (context.differences && context.differences.content) {
                this.handler.handleEditedMessage(context.message);
            }
        });
        this.bot.on('messageDelete', (context: Context) => {
            this.handler.handleDeletedMessage(context.message);
        });
    }

    private initStatusRota(): void {
        let currentStatus: number = 0;
        setInterval(() => {
            this.bot.gateway.setPresence({
                game: {
                    name: this.config.statusRotas.statuses[currentStatus].name.replace('{guilds}', this.bot.guilds.size.toString()),
                    type: this.config.statusRotas.statuses[currentStatus].type
                },
                status: this.bot.user?.presence?.status
            });
            currentStatus += 1;
            if (currentStatus === this.config.statusRotas.statuses.length) {
                currentStatus = 0;
            }
        }, this.config.statusRotas.delay);
    }

    public async sendMsg(channel: ChannelGuildText | string | null, message: string | object, options?: ISendMsgOptions): Promise<Message | null> {
        let msgToSend: string | object, targetChannel: string;
        if (!options) {
            options = {};
        }
        if (channel === null) {
            throw new Error('Channel argument was null');
        }

        msgToSend = message;

        if (options.type) {
            switch (options.type) {
            case MESSAGE_TYPE_EMOTES.SUCCESS:
                msgToSend = `${this.config.emotes.success} ${message}`;
                break;
            case MESSAGE_TYPE_EMOTES.ERROR:
                msgToSend = `${this.config.emotes.error} ${message}`;
                break;
            case MESSAGE_TYPE_EMOTES.INFO:
                msgToSend = `${this.config.emotes.info} ${message}`;
                break;
            case MESSAGE_TYPE_EMOTES.LOADING:
                msgToSend = `${this.config.emotes.loading} ${message}`;
                break;
            default:
                break;
            }
        }
        if (options.noEscapeMentions === false || options.noEscapeMentions === undefined && typeof msgToSend === 'string') {
            msgToSend = Markup.escape.mentions(<string>msgToSend);
        }
        let responseMessage: Message;
        if (options.edit && !this.bot.messages.get(options.edit)) {      // If message has been deleted and it's being edited
            return null;
        }
        let channelId: string;
        switch (typeof channel) {
        case 'object':
            channelId = channel.id;
            break;
        case 'string':
            channelId = channel;
            break;
        default:
            throw new Error('The channel paramater must either be a channel object or channel ID');
        }
        if (options.edit) {
            responseMessage = await this.bot.rest.editMessage(channelId, options.edit, msgToSend);
        } else {
            responseMessage = await this.bot.rest.createMessage(channelId, msgToSend);
        }
        if (options.storeAsResponseForUser) {
            this.handler.storeCommandResponse(options.storeAsResponseForUser.message, responseMessage.id, options.storeAsResponseForUser.user);
        }
        return responseMessage;
    }

    public async request(url: string, type: REQUEST_TYPES, set?: any, args?: any): Promise<superagent.Response | null> {
        if (type === REQUEST_TYPES.GET || !type) {
            const response: superagent.Response = await superagent.get(url);
            return response;
        } else if (type === REQUEST_TYPES.POST) {
            const response: superagent.Response = await superagent
                .post(url)
                .set(set)
                .send(args);
            return response;
        }
        return null;
    }

    public sql(query: string, values?: any[]): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            this.db.query(query, values || [], (err: any, res: any) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    public parseNew(input: string, message: Message, args: string[] = [], tag: ITag) {
        return new Parser(this.bot, {
            message,
            getMemberFromString: this.resolver.resolveMember
        }, this).parse(input, args, tag);
    }

    public addResponseMessage(originMessage: Message, responseMessage: string): Map<string, Array<ICommandResponse>> {
        return this.handler.storeCommandResponse(originMessage.id, responseMessage, originMessage.author.id);
    }
}
