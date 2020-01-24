import Assyst from './Assyst';
import { User, Member, Guild } from 'detritus-client/lib/structures';
import { IFlag, IFlagInfo } from './Interfaces';
import Command from './Command';
import { PERMISSION_LEVELS } from './Enums';

export default class Resolver {
    public client: Assyst;

    constructor(client: Assyst) {
        this.client = client;
    }

    /**
     * Resolves a user
     * 
     * @param {string} str What to search for
     * @returns {User?}
     */
    resolveUser(str: string): User | undefined {
        return this.client.bot.users.find((u: User) => u.username.toLowerCase() === str.toLowerCase() ||
            u.username.toLowerCase().includes(str.toLowerCase()));
    }

    /**
     * Resolves a guild member
     * 
     * @param {string} str What to search for
     * @returns {Member?}
     */
    resolveMember(str: string, guild: Guild): Member | undefined {
        return guild.members.find((m: Member) => {
            const name: string = m.nick || m.user.username;
            return name.toLowerCase() === str.toLowerCase() || name.includes(str);
        });
    }

    /**
     * Resolves flags
     * 
     * @param {str | string[]} str
     * @param {Command} command 
     * @param {PERMISSION_LEVELS}
     * @returns {IFlag[]} 
     */
    resolveFlags(str: string | Array<string>, command: Command, authorPermLevel: number = PERMISSION_LEVELS.OWNER): Array<IFlag> {
        const flags: Array<IFlag> = [];
        let args: Array<string>;
        if (!Array.isArray(str)) {
            args = str.split(' ');
        } else {
            args = str;
        }

        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith('-') && args[i].length > 1 && !args[i].startsWith('--')
                && command.validFlags.filter((f: IFlagInfo) => authorPermLevel >= f.permissionLevel)
                    .map(j => j.name)
                    .includes(args[i].substr(1, args[i].length))) {
                flags.push({
                    name: args[i].substr(1, args[i].length)
                });
            } else if (args[i].startsWith('--') && args[i].length > 1
                && command.validFlags.filter((f: IFlagInfo) => authorPermLevel >= f.permissionLevel)
                    .map(j => j.name)
                    .includes(args[i].substr(2, args[i].length))) {
                flags.push({
                    name: args[i].substr(2, args[i].length),
                    value: args[i + 1]
                });
            }
        }

        return flags;
    }
}