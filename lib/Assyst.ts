import { ShardClient, Utils } from 'detritus-client';
import { IAssystOptions } from './CInterfaces'
import { IEmotes, IStaff, ISendMsgOptions } from './Interfaces';
import Command from './Command'
import AssystUtils from './Utils'
import Handler from './Handler';
import Resolver from './Resolver';
import { readdirSync } from 'fs';
import { Context } from 'detritus-client/lib/command'
import { ChannelGuildText, Message } from 'detritus-client/lib/structures'
import { MESSAGE_TYPE_EMOTES } from './Enums'

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

    constructor(options: IAssystOptions) {
        this.bot = options.bot || new ShardClient(options.config.tokens.bot);
        this.version = options.config.version;
        this.description = options.config.description;
        this.emotes = options.config.emotes;
        this.staff = options.config.staff;
        this.prefix = options.config.prefix;
        this.utils = new AssystUtils;
        this.commands = new Map();
        this.handler = new Handler(this);
        this.resolver = new Resolver(this);

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
            this.commands.set(command.name.toLowerCase(), new command(this));
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
        let msgToSend: string;
        if(!options) {
            options = {}
        }
        if(channel === null) {
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
}