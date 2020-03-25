import { Listener, GuildConfig, Module, ListenerData } from 'axoncore';
import { Guild } from 'detritus-client/lib/structures';

class GuildDelete extends Listener {
    constructor(module: Module, data?: ListenerData) {
        super(module, data);

        /** Event Name (Discord name) */
        this.eventName = 'guildDelete';
        /** Event name (Function name) */
        this.label = 'guildDelete';

        this.enabled = true;

        this.info = {
            owners: [],
            description: 'Guild Delete event',
        };
    }

    execute(guild: Guild, guildConfig: GuildConfig): Promise<void> { // eslint-disable-line 
        this.axon.logger.info(`Guild Deleted: ${guild.name} [${guild.id}]`);
        return Promise.resolve();
    }
}

export default GuildDelete;
