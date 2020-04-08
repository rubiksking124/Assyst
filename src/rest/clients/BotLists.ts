import ClientBase from '../ClientBase';

import { dbl, discordbotlist } from '../../../config.json';

import { Request } from 'detritus-rest';
import { ShardClient } from 'detritus-client';

interface PostResults {
    dbl: any,
    discordbotlist: any
}

export default class BotListsRestClient extends ClientBase {
  constructor () {
    super({
      authKey: undefined,
      clientName: 'botlists',
      baseUrl: ''
    });
  }

  public async postStats (): Promise<PostResults> {
    const results: PostResults = { dbl: null, discordbotlist: null };
    try {
      results.dbl = await new Request({
        method: 'POST',
        url: new URL(`https://top.gg/api/bots/${(<ShardClient> this.controller.assyst.client).user?.id}/stats`),
        settings: {
          timeout: 5000
        },
        headers: {
          Authorization: dbl
        },
        body: {
          server_count: (<ShardClient> this.controller.assyst.client).guilds.size,
          shard_count: 1
        }
      }).send().then(async (v) => JSON.parse(await v.text()));
    } catch (e) {
      results.dbl = e.message;
    }
    try {
      results.discordbotlist = await new Request({
        method: 'POST',
        url: new URL(`https://discordbotlist.com/api/bots/${(<ShardClient> this.controller.assyst.client).user?.id}/stats`),
        settings: {
          timeout: 5000
        },
        headers: {
          Authorization: `Bot ${discordbotlist}`
        },
        body: {
          guilds: (<ShardClient> this.controller.assyst.client).guilds.size
        }
      }).send().then(async (v) => await v.text());
    } catch (e) {
      results.discordbotlist = e.message;
    }
    return results;
  }
}
