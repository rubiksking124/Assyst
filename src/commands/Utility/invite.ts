import { Context } from 'detritus-client/lib/command';

import { ShardClient } from 'detritus-client';

import Assyst from '../../structures/Assyst';

export default {
  name: 'invite',
  responseOptional: true,
  metadata: {
    description: 'Fetch the Assyst invite',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 3000
  },
  run: async (assyst: Assyst, ctx: Context, sargs: any) => {
    return ctx.editOrReply(`Bot invite: <${(<ShardClient> assyst.client).application?.oauth2UrlFormat({ scope: 'bot', permissions: 0 })}>\nJoin the support server: <https://jacher.io/assyst>`);
  }
};
