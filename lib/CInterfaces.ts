import { ShardClient } from 'detritus-client';
import { Message } from 'detritus-client/lib/structures';
import { IFlagInfo, IInfo, IFlag } from './Interfaces'
import Config from './Config'
import Assyst from './Assyst'
export interface IAssystOptions {
    config: Config,
    bot?: ShardClient
}
export interface ICommandOptions {
    name: string,
    timeout: number,
    info: IInfo,
    assyst: Assyst
    permissionLevel?: number,
    aliases?: Array<string>,
    validFlags?: Array<IFlagInfo>,
    nsfw?: boolean,
    visibleInHelp?: boolean,
    argsMin?: number,
}
export interface ICommandContext {
    args: string[],
    message: Message,
    reply: (options: any) => Promise<Message>
    flags: Array<IFlag>
}