import { Guild, User, ChannelGuildText } from 'detritus-client/lib/structures';
export interface IStaff {
    owners: Array<string>,
    admins: Array<string>,
    contributors: Array<string>
}
export interface IEmotes {
    success: string,
    error: string,
    loading: string,
    info: string
}
export interface ICooldown {
    timestamp: number,
    effectiveOn: ChannelGuildText | Guild | User
}
export interface IFlagInfo {
    name: string,
    description: string,
    argumented: boolean,
    accepts?: Array<string>
}
export interface IFlag {
    name: string,
    content?: string
}
export interface IInfo {
    description: string,
    examples: Array<string>,
    usage: string,
    author: string
}