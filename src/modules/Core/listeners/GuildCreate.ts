import { Listener, GuildConfig, Module, ListenerData } from 'axoncore';
import { Guild } from 'detritus-client/lib/structures';

class GuildCreate extends Listener {
    constructor(module: Module, data?: ListenerData) {
        super(module, data);

        /** Event Name (Discord name) */
        this.eventName = 'guildCreate';
        /** Event name (Function name) */
        this.label = 'guildCreate';

        this.enabled = true;

        this.info = {
            owners: [],
            description: 'Guild Create event',
        };
    }

    execute(guild: Guild, guildConfig: GuildConfig): Promise<void> { // eslint-disable-line 
        this.axon.logger.info(`Guild Created: ${guild.name} [${guild.id}]`);
        return Promise.resolve();
    }
}

export default GuildCreate;
