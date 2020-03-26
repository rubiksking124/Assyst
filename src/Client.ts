import { AxonClient, AxonOptions, GuildConfig, Command, CommandEnvironment } from 'axoncore';

import { db } from './configs/secret.json'

import { ShardClient } from 'detritus-client';

import { Message } from 'detritus-client/lib/structures/message'

import * as modules from './modules/index';

import { Pool } from 'pg';

/**
 * Example - Client constructor
 *
 * @author KhaaZ
 *
 * @class Client
 * @extends AxonCore.AxonClient
 */
class Client extends AxonClient {

    public db: Pool

    constructor(client: ShardClient, axonOptions: AxonOptions) {
        super(client, axonOptions, modules);
        this.db = new Pool(db)
    }

    onInit(): true {
        this.staff.contributors = [];
        return true;
    }

    onStart(): Promise<true> {
        return Promise.resolve(true);
    }

    onReady(): Promise<true> {
        return Promise.resolve(true);
    }

    initStatus() {
        // called after ready event
        // overrides default editStatus
        // used to setup custom status
        this.botClient.editStatus(null, {
            name: `AxonCore | ${this.settings.prefixes[0]}help`,
            type: 0,
        } );
    }

    // disabled
    // eslint-disable-next-line no-unused-vars
    $sendFullHelp(msg: Message, guildConfig: GuildConfig) {
        // override sendFullHelp method
        return this.axonUtils.sendMessage(msg.channel, 'Full Help override');
    }

    // disabled
    // eslint-disable-next-line no-unused-vars
    $sendHelp(command: Command, env: CommandEnvironment) {
        // override sendHelp method
        return this.axonUtils.sendMessage(env.msg.channel, `Help override for ${command.label}`);
    }
}

export default Client;
