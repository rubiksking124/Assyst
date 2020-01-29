import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { MESSAGE_TYPE_EMOTES, COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';

export default class Ping extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'ping',
            aliases: [ 'pong', 'pang' ],
            assyst,
            cooldown: {
                timeout: 1500,
                type: COOLDOWN_TYPES.GUILD
            },
            info: {
                description: 'Ping the bot',
                examples: ['ping'],
                usage: "",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const message = await this.sendMsg(context.message.channel, 'Pong!', { type: MESSAGE_TYPE_EMOTES.LOADING });
        try {
            const { gateway, rest } = await this.bot.ping();
            return this.sendMsg(context.message.channel, `Pong! Gateway: ${gateway}ms, REST: ${rest}ms`, { edit: message?.id, type: MESSAGE_TYPE_EMOTES.SUCCESS,storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            } })
        } catch(e) {
            return this.sendMsg(context.message.channel, `Pong! >1000ms`, { edit: message?.id, type: MESSAGE_TYPE_EMOTES.SUCCESS, storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            } });
        }
        /*.catch((): Promise<Message | null> => {
            return this.sendMsg(context.message.channel, `Pong! >1000ms`, { edit: message?.id, type: MESSAGE_TYPE_EMOTES.SUCCESS })
        })*/       
    }
}