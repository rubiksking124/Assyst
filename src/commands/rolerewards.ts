import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';


export default class RoleRewards extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'rolerewards',
            aliases: ['rr'],
            assyst,
            cooldown: {
                timeout: 10000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Base command for role rewards functionality',
                examples: ['add-role 212725338969473025 10'],
                usage: '[addrole|removerole|list] <id> <level>',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        if(!context.message.channel?.guild?.can('ADMINISTRATOR', context.message.member) && !this.assyst.config.staff.owners.includes(context.message.author.id)) {
            return null;
        }
        const storeAsResponseForUser = {
            user: context.message.author.id,
            message: context.message.id
        };
        if(context.args.length === 0 || !['addrole', 'removerole', 'list'].includes(context.args[0])) {
            return context.reply({
                embed: {
                    title: 'Role Rewards',
                    description: `This command is an alternative method to using MEE6 role rewards on your server. It does not require you to pay to use it.\n
                    You can add and remove roles with this command, and the users with the role will be updated every 24 hours.\n
                    Adding and removing roles requires that you have administrator permission. Role rewards will not work if the bot does not have manage roles permission.`,
                    color: this.assyst.config.embedColour,
                    fields: [
                        {
                            name: 'addrole',
                            value: 'Add a new role reward to the server.\nThe syntax is `addrole [role id] [level to grant this role]`',
                            inline: false
                        },
                        {
                            name: 'removerole',
                            value: `Remove an existing role reward from this server.\nThe syntax is \`addrole [role id] [level to grant this role]\`
                            This command does **NOT** remove the role reward from members that already have it.`,
                            inline: false
                        },
                        {
                            name: 'list',
                            value: 'List all existing role rewards.',
                            inline: false
                        }
                    ]
                }
            }, {
                storeAsResponseForUser
            });
        } else if(context.args[0] === 'addrole') {
            if(!context.message.guild.roles.map(i => i.id).includes(context.args[1])) {
                return context.reply('That isn\'t a valid role ID.', {
                    storeAsResponseForUser,
                    type: MESSAGE_TYPE_EMOTES.ERROR
                });
            } else if(!context.args[2] || isNaN(parseInt(context.args[2])) || parseInt(context.args[2]) > 150 || parseInt(context.args[2]) < 1) {
                return context.reply('Either you didn\'t supply a level to grant this role, the level was invalid, higher than 150 or less than 1.', {
                    storeAsResponseForUser,
                    type: MESSAGE_TYPE_EMOTES.ERROR
                });
            } else {
                try {
                    await this.assyst.sql('insert into mee6_role_rewards values ($1, $2, $3)', [context.message.guild.id, context.args[1], context.args[2]]);
                } catch(e) {
                    return context.reply(e.message, {
                        storeAsResponseForUser,
                        type: MESSAGE_TYPE_EMOTES.ERROR
                    });
                }
                return context.reply('Role reward added successfully.', {
                    storeAsResponseForUser,
                    type: MESSAGE_TYPE_EMOTES.SUCCESS
                });
            }
        } else if(context.args[0] === 'removerole') {
            if(!context.message.guild.roles.map(i => i.id).includes(context.args[1])) {
                return context.reply('That isn\'t a valid role ID.', {
                    storeAsResponseForUser,
                    type: MESSAGE_TYPE_EMOTES.ERROR
                });
            } else {
                try {
                    await this.assyst.sql('delete from mee6_role_rewards where guild = $1 and role = $2', [context.message.guild.id, context.args[1]]);
                } catch(e) {
                    return context.reply(e.message, {
                        storeAsResponseForUser,
                        type: MESSAGE_TYPE_EMOTES.ERROR
                    });
                }
                return context.reply('This role is no longer a role reward.', {
                    storeAsResponseForUser,
                    type: MESSAGE_TYPE_EMOTES.SUCCESS
                });
            }
        } else if (context.args[0] === 'list') {
            return null;
        } else {
            return null;
        }
    }
}