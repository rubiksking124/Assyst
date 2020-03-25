import { Listener, GuildConfig, Module, ListenerData } from 'axoncore';
import { Message } from 'detritus-client/lib/structures';

class MessageCreateLog extends Listener {
    constructor(module: Module, data?: ListenerData) {
        super(module, data);

        /** Event Name (Discord name) */
        this.eventName = 'messageCreate';
        /** Event name (Function name) */
        this.label = 'messageCreateLog';

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
        this.axon.logger.verbose(`Msg ${message.channel.guild.id}`);
        return Promise.resolve();
    }
}

export default MessageCreateLog;
