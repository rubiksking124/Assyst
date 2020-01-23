import { ShardClient } from 'detritus-client';
import { IAssystOptions } from './CInterfaces'
import { IEmotes, IStaff } from './Interfaces';
import Command from './Command'
import Utils from './Utils'
import { readdir } from 'fs';
import { promisify } from 'util';

export default class Assyst {

    public bot: ShardClient;
    public version: string;
    public description: string;
    public emotes: IEmotes;
    public staff: IStaff;
    public utils: Utils;
    public commands: Map<string, Command>;

    constructor(options: IAssystOptions) {
        this.bot = options.bot || new ShardClient(options.config.tokens.bot);
        this.version = options.config.version;
        this.description = options.config.description;
        this.emotes = options.config.emotes;
        this.staff = options.config.staff;
        this.utils = new Utils;
        this.commands = new Map();
    }

    private loadCommands(): void {
        
    };
}