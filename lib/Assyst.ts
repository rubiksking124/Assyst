import { ShardClient, Utils } from 'detritus-client';
import { IAssystOptions } from './CInterfaces'
import { IEmotes, IStaff, ISendMsgOptions } from './Interfaces';
import Command from './Command'
import AssystUtils from './Utils'
import Handler from './Handler';
import Resolver from './Resolver';
import { readdirSync } from 'fs';
import { Context } from 'detritus-client/lib/command'
import { ChannelGuildText, ChannelDM, Message } from 'detritus-client/lib/structures'
import { MESSAGE_TYPE_EMOTES, REQUEST_TYPES } from './Enums'
import CooldownManager from './CooldownManager'
import superagent from 'superagent';
import { TeamMembershipStates } from 'detritus-client/lib/constants';
const { Paginator } = require('detritus-pagination'); // TODO: any because I fucked up typings lol, will fix soon

const { Markup } = Utils;

export default class Assyst {

    public bot: ShardClient;
    public version: string;
    public description: string;
    public prefix: string;
    public emotes: IEmotes;
    public staff: IStaff;
    public utils: AssystUtils;
    public commands: Map<string, Command>;
    public handler: Handler;
    public resolver: Resolver;
    public cooldownManager: CooldownManager
    public responseMessages: Map<string, Array<string>>
    public paginator: any; // todo: typings
    public apis: any; // todo: typings
    public reactions: any; // ^

    constructor(options: IAssystOptions) {
        this.bot = options.bot || new ShardClient(options.config.tokens.bot);
        this.version = options.config.version;
        this.description = options.config.description;
        this.emotes = options.config.emotes;
        this.staff = options.config.staff;
        this.prefix = options.config.prefix;
        this.apis = options.config.apis;
        this.reactions = options.config.reactions;
        this.utils = new AssystUtils;
        this.commands = new Map();
        this.responseMessages = new Map();
        this.handler = new Handler(this);
        this.resolver = new Resolver(this);
        this.cooldownManager = new CooldownManager()
        this.paginator = new Paginator(this.bot, {
            maxTime: options.config.paginatorTimeout,
            pageLoop: true
        });

        this.loadCommands()
            .then((c: Map<string, Command>) => {
                console.log(`Loaded ${c.size} commands`);
            });

        this.initListeners();
    }

    private async loadCommands(): Promise<Map<string, Command>> {
        const files = readdirSync('./src/commands').filter((f: string) => f.endsWith(".js"));

        for (const file of files) {
            const command: any = await import(`../src/commands/${file}`).then((m: any) => m.default);
            const instance: Command = new command(this);
            this.commands.set(instance.name.toLowerCase(), instance);
            console.log(`Loaded command: ${command.name}`);
        }

        return this.commands;
    };

    private initListeners(): void {
        this.bot.on("messageCreate", (context: Context) => {
            this.handler.handleMessage(context.message)
        });
    }

    public async sendMsg(channel: ChannelGuildText | string | null, message: string | Message, options?: ISendMsgOptions): Promise<Message | null> {
        let msgToSend: string, targetChannel: string;
        if (!options) {
            options = {}
        }
        if (channel === null) {
            throw new Error('Channel argument was null');
        }

        if (typeof message === 'string') {
            msgToSend = message;
        } else {
            msgToSend = message.content
        }
        if (options.type) {
            switch (options.type) {
                case MESSAGE_TYPE_EMOTES.SUCCESS:
                    msgToSend = `${this.emotes.success} ${message}`;
                    break;
                case MESSAGE_TYPE_EMOTES.ERROR:
                    msgToSend = `${this.emotes.error} ${message}`;
                    break;
                case MESSAGE_TYPE_EMOTES.INFO:
                    msgToSend = `${this.emotes.info} ${message}`;
                    break;
                case MESSAGE_TYPE_EMOTES.LOADING:
                    msgToSend = `${this.emotes.loading} ${message}`;
                    break;
                default:
                    break;
            }
        }
        if (options.noEscapeMentions === false || options.noEscapeMentions === undefined) {
            msgToSend = Markup.escape.mentions(msgToSend);
        }
        if(options.storeAsResponseForUser) {
            let cid: string;
            if(typeof channel === 'object') {
                cid = channel.id;
            } else {
                cid = channel;
            }
            let channels: Array<string>;
            if(this.responseMessages.get(options.storeAsResponseForUser) !== undefined) {
                channels = [...<Array<string>>this.responseMessages.get(options.storeAsResponseForUser), cid];
            } else {
                channels = [cid];
            }
            this.responseMessages.set(options.storeAsResponseForUser, channels);
        }
        switch (typeof channel) {
            case 'object':
                if (channel.id && !options.edit) {
                    return this.bot.rest.createMessage(channel.id, msgToSend);
                }
                if (options.edit) {
                    return this.bot.rest.editMessage(channel.id, options.edit, msgToSend);
                }
                throw new Error('Invalid channel object');
            case 'string':
                if (options.edit) {
                    return this.bot.rest.editMessage(channel, options.edit, msgToSend);
                }
                return this.bot.rest.createMessage(channel, msgToSend);
            default:
                throw new Error('The channel paramater must either be a channel object or channel ID');
        }
    }

    public async request(url: string, type: REQUEST_TYPES, set?: any, args?: any): Promise<superagent.Response | null> {
        if (type === REQUEST_TYPES.GET) {
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
}