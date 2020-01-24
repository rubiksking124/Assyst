import { Message } from 'detritus-client/lib/structures';
import Assyst from './Assyst'
import Command from './Command'
import { IFlag } from './Interfaces';
import { PERMISSION_LEVELS } from './Enums'
export default class Handler {
    public assyst: Assyst;
    
    constructor(client: Assyst) {
        this.assyst = client;
    }
    
    public handleMessage(message: Message): void {
        const { content } = message;
        if(!content.startsWith(this.assyst.prefix) && !content.startsWith(`<@${this.assyst.bot.user?.id}>`) && !content.startsWith(`<@!${this.assyst.bot.user?.id}>`)) {
            return;
        }
        
        const [command, ...args] = content.substr(this.assyst.prefix.length).split(/ +/);
        if (!this.assyst.commands.has(command.toLowerCase())) {
            return;
        }
        
        const targetCommand = <Command>this.assyst.commands.get(command.toLowerCase());
        const permissionLevel: number = this.checkPermissions(message.author.id);
        if (permissionLevel /* user */ < targetCommand.permissionLevel) {
            return;
        }

        const flags: Array<IFlag> = this.resolveFlags(args, permissionLevel, targetCommand)

        targetCommand.execute({
            args,
            message,
            flags,
            reply: (...args) => message.reply(...args)
        });
    }

    private resolveFlags(args: Array<string>, authorPermLevel: number, command: Command): Array<IFlag> {
        let flags: Array<IFlag> = [];

        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith('-') && args[i].length > 1 && !args[i].startsWith('--') && command.validFlags.filter(f => authorPermLevel >= f.permissionLevel).map(j => j.name).includes(args[i].substr(1, args[i].length) ) ) {
                flags.push({
                    name: args[i].substr(1, args[i].length)
                });
            } else if (args[i].startsWith('--') && args[i].length > 1 && command.validFlags.filter(f => authorPermLevel >= f.permissionLevel).map(j => j.name).includes(args[i].substr(2, args[i].length) ) ) {
                flags.push({
                    name: args[i].substr(2, args[i].length), 
                    value: args[i + 1]
                });
            }
        }

        return flags;
    }

    private removeFlags(args: Array<string>, flagsToRemove: Array<IFlag>) {
        args.forEach(arg => {
            if (arg.startsWith('--') && flagsToRemove.map(i => i.name).includes(arg.slice(2) ) ) {
                args.splice(args.indexOf(arg), 2);
            } else if (arg.startsWith('-') && flagsToRemove.map(i => i.name).includes(arg.slice(1) ) ) {
                args.splice(args.indexOf(arg), 1);
            }
        } );
        return args;
    }

    private checkPermissions(id: string): number {
        if (this.assyst.staff.owners.includes(id)) {
            return PERMISSION_LEVELS.OWNER;
        } else if (this.assyst.staff.admins.includes(id)) {
            return PERMISSION_LEVELS.ADMIN;
        } else {
            return PERMISSION_LEVELS.NORMAL;
        }
    }
}