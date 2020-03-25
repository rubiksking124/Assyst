import { ShardClient } from 'detritus-client';

import { AxonOptions } from 'axoncore';

import Client from './Client';

import botConfig from './configs/config.json';
import secret from './configs/secret.json';
import lang from './configs/lang.json';

import MyUtils from './MyUtils';

const axonOptions = new AxonOptions( {
    prefixes: botConfig.prefixes,
    settings: botConfig.settings,
    lang,
    logo: null,

    info: botConfig.info,
    staff: botConfig.staff,
    template: botConfig.template,
    custom: { },
},
// webhooks
secret.webhooks,
// extensions
{
    utils: MyUtils, // use your own Utils
    logger: null, // custom Logger
    DBProvider: null, // custom DB Service
    DBLocation: `${__dirname}/database/`,

    axonConfig: null,
    guildConfig: null,
} );

/**
 * new AxonClient(token, erisOptions, AxonOptions, modules)
 *
 * new Client(token, erisOptions, AxonOptions) => Modules imported in Client
 */
const client = new ShardClient(
    secret.bot.token,
    {
        cache: {
            emojis: { enabled: false },
            voiceCalls: { enabled: false },
            voiceConnections: { enabled: false },
            voiceStates: { enabled: false },
            presences: { enabled: false },
            sessions: { enabled: false },
            applications: { enabled: false },
            notes: { enabled: false },
            connectedAccounts: { enabled: false },
            typings: { enabled: false },
            users: { enabled: false },
        },
        gateway: {
            identifyProperties: {
                $browser: 'Discord iOS'
            },
            loadAllMembers: true
        },
    }
);

const Bot = new Client(
    client,
    axonOptions,
);

export default Bot;
