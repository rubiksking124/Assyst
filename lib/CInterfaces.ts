import { ShardClient } from 'detritus-client';
import { Message } from 'detritus-client/lib/structures';
import { IFlagInfo, IInfo } from './Interfaces'
import Config from './Config'
import Assyst from './Assyst'
export interface IAssystOptions {
    config: Config,
    bot?: ShardClient
}
export interface ICommandOptions {
    name: string,
    execute: () => void,
    permissionLevel: number,
    timeout: number,
    argsMin: number,
    aliases: Array<string>,
    validFlags: Array<IFlagInfo>,
    nsfw: boolean,
    visibleInHelp: boolean,
    info: IInfo,
    assyst: Assyst
}
export interface ICommandContext {
    args: string[],
    message: Message
}