import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { QueryResult } from 'pg';


export default class Prefix extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'prefix',
            aliases: ['p'],
            assyst,
            argsMin: 0,
            cooldown: {
                timeout: 10000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Edit the guild prefix (requires admin)',
                examples: ['<>', ''],
                usage: '[new prefix]',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        if(context.args.length === 0) {
            const prefix = this.assyst.caches.prefixes.get(<string>context.message.channel?.guild?.id) || await this.assyst.sql('select prefix from prefixes where guild = $1', [ context.message.channel?.guild?.id ]).then((r: QueryResult) => r.rows[0].prefix);
            return context.reply(`Current prefix in **${context.message.channel?.guild?.name}**: \`${prefix}\``);
        }
        if(!context.message.channel?.guild?.can('ADMINISTRATOR', context.message.member) && !this.assyst.config.staff.owners.includes(context.message.author.id)) {
            return null;
        }
        if(context.args[0].length > 3) {
            return context.reply('The prefix must be 3 characters or less!', {
                type: MESSAGE_TYPE_EMOTES.ERROR,
                storeAsResponseForUser: {
                    message: context.message.id,
                    user: context.message.author.id
                }
            });
        }
        const newPrefix: string = context.args[0];
        await this.assyst.sql('update prefixes set prefix = $1 where guild = $2', [newPrefix, <string>context.message.channel?.guild?.id]);
        this.assyst.caches.prefixes.set(<string>context.message.channel?.guild?.id, newPrefix);
        return context.reply(`Prefix is now: \`${newPrefix}\``, {
            type: MESSAGE_TYPE_EMOTES.SUCCESS,
            storeAsResponseForUser: {
                message: context.message.id,
                user: context.message.author.id
            }
        });
    }
}