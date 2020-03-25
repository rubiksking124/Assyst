import { Listener, Module, ListenerData, GuildConfig } from 'axoncore';
import { Message } from 'detritus-client/lib/structures';

class MessageCreateMod extends Listener {
    constructor(module: Module, data?: ListenerData) {
        super(module, data);

        /** Event Name (Discord name) */
        this.eventName = 'messageCreate';
        /** Event name (Function name) */
        this.label = 'messageCreateMod';

        this.enabled = true;

        this.info = {
            owners: [],
            description: 'Log Message Create events',
        };
    }

    execute(message: Message, guildConfig: GuildConfig) { // eslint-disable-line
        if (!message.channel || !message.channel.guild) {
            return Promise.resolve();
        }
        this.axon.logger.verbose(`Prefix: ${guildConfig.prefixes}`);
        return Promise.resolve();
    }
}

export default MessageCreateMod;
