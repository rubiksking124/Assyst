import Config from './Config';
import { ShardClient } from 'detritus-client';
import { IAssystOptions } from './CInterfaces'
import { IEmotes, IStaff } from './Interfaces';
import Utils from './Utils'
export default class Assyst {
    public bot: ShardClient;
    public version: string;
    public description: string;
    public emotes: IEmotes
    public staff: IStaff
    public utils: Utils
    constructor(options: IAssystOptions) {
        this.bot = options.bot;
        this.version = options.config.version;
        this.description = options.config.description;
        this.emotes = options.config.emotes;
        this.staff = options.config.staff;
        this.utils = new Utils
    }
}