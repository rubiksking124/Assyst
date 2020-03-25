import { Command, CommandOptions, CommandResponse, Module } from 'axoncore';

import Pong from './Ping_Pong';
import { Message } from 'detritus-client/lib/structures';

class Ping extends Command {
    constructor(module: Module) {
        super(module);

        this.label = 'ping';
        this.aliases = [
            'ping',
            'pang',
            'pung',
        ];

        this.hasSubcmd = true;

        this.info = {
            owners: ['KhaaZ'],
            name: 'ping',
            description: 'Ping the bot.',
            usage: 'ping',
            examples: ['ping'],
        };

        this.options = new CommandOptions(this, {
            argsMin: 0,
            guildOnly: false,
        } );
    }
    
    init() {
        return [Pong];
    }

    async execute( { msg }: { msg: Message } ) {
        const start = Date.now();
        const mess = await this.sendMessage(msg.channel, 'Pong! ');
        if (!mess) {
            return new CommandResponse( { success: false } );
        }

        const diff = (Date.now() - start);
        this.editMessage(mess, `Pong! \`${diff}ms\``);

        return new CommandResponse( { success: true } );
    }
}

export default Ping;
