import { ShardClient, Utils } from 'detritus-client';
import { IAssystOptions, ICommandContext } from './CInterfaces'
import { IEmotes, IStaff, ISendMsgOptions, ICommandResponse } from './Interfaces';
import Command from './Command'
import AssystUtils from './Utils'
import Handler from './Handler';
import Resolver from './Resolver';
import { readdirSync } from 'fs';
import { Context } from 'detritus-client/lib/command'
import { ChannelGuildText, ChannelDM, Message, MessageEmbed } from 'detritus-client/lib/structures'
import { MESSAGE_TYPE_EMOTES, REQUEST_TYPES } from './Enums'
import CooldownManager from './CooldownManager'
import superagent from 'superagent';
// import { TeamMembershipStates } from 'detritus-client/lib/constants';

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
    public responseMessages: Map<string, Array<ICommandResponse>>
    public paginator: any; // todo: typings
    public apis: any; // todo: typings
    public reactions: any; // ^
    public errorChannel: string;
    public embedColour: number;
    public searchMessages: number;

    constructor(options: IAssystOptions) {
        this.bot = options.bot || new ShardClient(options.config.tokens.bot, {
            cache: true,
            gateway: {
                loadAllMembers: true,
                identifyProperties: {
                    $browser: "Discord iOS"
                }
            }
        });
        this.version = options.config.version;
        this.description = options.config.description;
        this.emotes = options.config.emotes;
        this.staff = options.config.staff;
        this.prefix = options.config.prefix;
        this.apis = options.config.apis;
        this.errorChannel = options.config.errorChannel
        this.reactions = options.config.reactions;
        this.embedColour = options.config.embedColour
        this.searchMessages = options.config.searchMessages;
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
        const files = readdirSync('./src/commands').filter((f: string) => f.endsWith(".js") && !f.includes('template'));

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
        this.bot.on('messageUpdate', (context: any) => {
            if(context.differences && context.differences.content) {
                this.handler.handleEditedMessage(context.message)
            }
        })
        this.bot.on('messageDelete', (context: Context) => {
            this.handler.handleDeletedMessage(context.message)
        })
    }

    public async sendMsg(channel: ChannelGuildText | string | null, message: string | object, options?: ISendMsgOptions): Promise<Message | null> {
        let msgToSend: string | object, targetChannel: string;
        if (!options) {
            options = {}
        }
        if (channel === null) {
            throw new Error('Channel argument was null');
        }

        msgToSend = message
        
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
        if (options.noEscapeMentions === false || options.noEscapeMentions === undefined && typeof msgToSend === 'string') {
            msgToSend = Markup.escape.mentions(<string>msgToSend);
        }
        let responseMessage: Message
        if(options.edit && !this.bot.messages.get(options.edit)) {      // If message has been deleted and it's being edited
            return null;
        }
        let channelId: string;
        switch (typeof channel) {
            case 'object':
                channelId = channel.id
                break;
            case 'string':
                channelId = channel
                break;
            default:
                throw new Error('The channel paramater must either be a channel object or channel ID');     
        }
        if (options.edit) {
            responseMessage = await this.bot.rest.editMessage(channelId, options.edit, msgToSend);
        } else {
            responseMessage = await this.bot.rest.createMessage(channelId, msgToSend);
        }
        if(options.storeAsResponseForUser) {
            this.handler.storeCommandResponse(options.storeAsResponseForUser.message, responseMessage.id, options.storeAsResponseForUser.user)
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
}
