import { MESSAGE_TYPE_EMOTES, COOLDOWN_TYPES } from './Enums'

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
    endUnix: number,
    effectiveOn: COOLDOWN_TYPES,
    sentMessage: boolean,
}
export interface ICooldownType {
    type: COOLDOWN_TYPES,
    timeout: number
}

export interface IFlagInfo {
    name: string,
    description: string,
    argumented: boolean,
    permissionLevel: number,
    accepts?: Array<string>
}
export interface IFlag {
    name: string,
    value?: string
}

export interface IInfo {
    description: string,
    examples: Array<string>,
    usage: string,
    author: string
}

export interface ISendMsgOptions {
    type?: MESSAGE_TYPE_EMOTES,
    noEscapeMentions?: boolean,
    edit?: string,
    storeAsResponseForUser?: string
}