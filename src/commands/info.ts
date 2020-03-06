import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { PERMISSION_LEVELS, REQUEST_TYPES, COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import git_rev_sync from 'git-rev-sync';
import os from 'os';
import { homepage } from '../../package.json';

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
                usage: '',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const commitHash: string = git_rev_sync.short();
        const version: string = this.assyst.config.version;
        const memoryUsage: string = (process.memoryUsage().rss / 1000 / 1000).toFixed(2);
        const guildCount: number = this.bot.guilds.size;
        const uptime: {
            days: number,
            hours: number,
            minutes: number,
            seconds: number
        } = this.utils.elapsed(process.uptime() * 1000);
        const processor: string = `${os.cpus().length}x ${os.cpus()[0].model}`;
        const gitRepo: string = homepage;
        const support: string = 'https://discord.gg/HNvk5UV';
        const dbSize: string = await this.assyst.sql('select pg_size_pretty(pg_database_size(\'assyst\'))').then(r => r.rows[0].pg_size_pretty);
        return this.sendMsg(context.message.channel, {
            embed: {
                title: 'Assyst Information',
                description: `[Git](${gitRepo}) | [Invite](${this.bot.application?.oauth2UrlFormat({ scope: 'bot', permissions: 0 })}) | [Support](${support})`,
                color: this.assyst.config.embedColour,
                fields: [
                    {
                        name: 'Counts',
                        value: `\`\`\`ml\nGuilds: ${guildCount}\nEvents: ${this.assyst.metrics.eventRate}/sec\nCommands: ${this.assyst.metrics.commands} (this session)\`\`\``,
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
                        name: 'Version',
                        value: version,
                        inline: true
                    },
                    {
                        name: 'Commit hash',
                        value: commitHash,
                        inline: true
                    },
                    {
                        name: 'DB size',
                        value: dbSize,
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