import { ShardClient } from 'detritus-client';
import { IAssystOptions } from './CInterfaces'
import { IEmotes, IStaff } from './Interfaces';
import Command from './Command'
import Utils from './Utils'
import Handler from './Handler';
import Resolver from './Resolver';
import { readdirSync } from 'fs';

export default class Assyst {

    public bot: ShardClient;
    public version: string;
    public description: string;
    public prefix: string;
    public emotes: IEmotes;
    public staff: IStaff;
    public utils: Utils;
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
        this.utils = new Utils;
        this.commands = new Map();
        this.handler = new Handler(this);
        this.resolver = new Resolver(this);

        this.loadCommands()
            .then((c: Map<string, Command>) => {
                console.log(`Loaded ${c.size} commands`);
            });
    }

    private async loadCommands(): Promise<Map<string, Command>> {
        const files = readdirSync('./src/commands').filter((f: string) => f.endsWith(".js"));

        for (const file of files) {
            const command: Command = await import(`../src/commands/${file}`);
            this.commands.set(command.name, command);
            console.log(`Loaded command: ${command.name}`)
        }

        return this.commands;
    };
}