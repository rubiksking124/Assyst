import { ICommandOptions, ICommandContext } from './CInterfaces'
import Assyst from './Assyst'
import { IInfo, IFlagInfo,  } from './Interfaces'
import { Message } from 'detritus-client/lib/structures'

export default class Command {
    public name: string;
    public permissionLevel: number;
    public timeout: number;
    public argsMin: number;
    public aliases: Array<string>;
    public validFlags: Array<IFlagInfo>;
    public nsfw: boolean;
    public visibleInHelp: boolean;
    public info: IInfo;
    public assyst: Assyst;
    public execute: (context: ICommandContext) => Message;

    constructor(options: ICommandOptions) {
        this.name = options.name;
        this.execute = options.execute;
        this.timeout = options.timeout;
        this.argsMin = options.argsMin;
        this.aliases = options.aliases;
        this.info = options.info;
        this.visibleInHelp = options.visibleInHelp;
        this.assyst = options.assyst;
        this.nsfw = options.nsfw;
        this.validFlags = options.validFlags;
        this.permissionLevel = options.permissionLevel;
    }
}