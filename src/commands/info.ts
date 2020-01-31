import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { PERMISSION_LEVELS, REQUEST_TYPES, COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import git_rev_sync from 'git-rev-sync';
import os from 'os';
import { homepage } from '../../package.json'

export default class Info extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'info',
            aliases: ['stats'],
            argsMin: 0,
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Get bot information',
                examples: [''],
                usage: "",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const commitHash: string = git_rev_sync.short();
        const version: string = this.assyst.version;
        const memoryUsage: string = (process.memoryUsage().heapUsed / 1000 / 1000).toFixed(2);
        const guildCount: number = this.bot.guilds.size;
        const userCount: number = this.bot.users.size;
        const uptime: {
            days: number,
            hours: number,
            minutes: number,
            seconds: number
        } = this.utils.elapsed(process.uptime() * 1000);
        const developers: Array<string | undefined> = this.assyst.staff.owners.map((d: string) => this.bot.users.get(d)?.username);
        const contibutors: Array<string | undefined> = this.assyst.staff.contributors.map((d: string) => this.bot.users.get(d)?.username);
        const processor: string = `${os.cpus().length}x ${os.cpus()[0].model}`;
        const gitRepo: string = homepage;
        return this.sendMsg(context.message.channel, {
            embed: {
                title: 'Assyst Information',
                description: `[Git](${gitRepo}) | [Invite](${this.bot.application?.oauth2UrlFormat({ scope: 'bot', permissions: 0 })})`,
                color: this.assyst.embedColour,
                fields: [
                    {
                        name: 'Counts',
                        value: `\`\`\`ml\nGuilds: ${guildCount}\nUsers: ${userCount}\n\`\`\``,
                        inline: false
                    },
                    {
                        name: 'Uptime',
                        value: `${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes, ${uptime.seconds} seconds`,
                        inline: false
                    },
                    {
                        name: 'Processor',
                        value: processor,
                        inline: false
                    },
                    {
                        name: 'Memory usage',
                        value: memoryUsage + ' MB',
                        inline: true
                    },
                    {
                        name: 'Developers',
                        value: developers.join('\n'),
                        inline: true
                    },
                    {
                        name: 'Contributors',
                        value: contibutors.join('\n')
                    },
                    {
                        name: 'Commit hash',
                        value: commitHash,
                        inline: true
                    }
                ]
            }
        }, {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
    }
}