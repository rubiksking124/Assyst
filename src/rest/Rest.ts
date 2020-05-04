import Assyst from '../structures/Assyst';

import {
  dbl,
  discordbotlist,
  fapi,
  gocode
} from '../../config.json';

import { ShardClient } from 'detritus-client';

import Endpoints from './Endpoints';

import { RequestTypes } from 'detritus-client-rest';
import { Request, RequestOptions } from 'detritus-rest';

interface PostResults {
  dbl: any,
  discordbotlist: any
}

export interface CodeList {
  status: number,
  data: Array<string>
}

interface CodeResult {
  data: {
      res: string,
      comp: number,
      timings: any[]
  },
  status: number
}

interface Node {
  id: number,
  host: string,
  port: number,
  ssl: false,
  ping: number,
  memory: number,
  available: boolean,
  queue: number
}

interface Zx8Info {
  urlQueue: number,
  totalURLs: number,
  rss: number,
  tableSize: number,
  queryCache: number,
  indexesPerSecond: number
}

interface Dataset {
  url: string,
  host: string,
  lastStatus: number,
  headers: string,
  lastRequest: string,
  lastResponseTime: number
}

interface HistoryApiResult {
  wikipedia: string,
  date: string,
  events: HistoryEvent[]
}

interface HistoryEvent {
  year: string,
  description: string,
  wikipedia: HistoryWikipedia[]
}

interface HistoryWikipedia {
  title: string,
  wikipedia: string
}

export default class RestController {
    public assyst: Assyst

    constructor (assyst: Assyst) {
      this.assyst = assyst;
    }

    public async postStats (): Promise<PostResults> {
      const results: PostResults = { dbl: null, discordbotlist: null };
      results.dbl = await this.postStatsToTopGG();
      results.discordbotlist = await this.postStatsToDiscordBotList();
      return results;
    }

    private async postStatsToTopGG () {
      return await this.sendRequest({
        method: 'POST',
        url: new URL(`${Endpoints.topgg}/${(<ShardClient> this.assyst.client).user?.id}/stats`),
        settings: {
          timeout: 5000
        },
        headers: {
          Authorization: dbl
        },
        body: {
          server_count: (<ShardClient> this.assyst.client).guilds.size,
          shard_count: 1
        }
      }).then(async (v) => await v.text());
    }

    private async postStatsToDiscordBotList () {
      return await this.sendRequest({
        method: 'POST',
        url: new URL(`${Endpoints.discordbotlist}/${(<ShardClient> this.assyst.client).user?.id}/stats`),
        settings: {
          timeout: 5000
        },
        headers: {
          Authorization: `Bot ${discordbotlist}`
        },
        body: {
          guilds: (<ShardClient> this.assyst.client).guilds.size
        }
      }).then(async (v) => await v.text());
    }

    public async screenshotWebPage (url: string, allowNsfw: boolean): Promise<Buffer | string> {
      return await this.sendRequest({
        url: new URL(`${Endpoints.fapi.screenshot}?allow_nsfw=${allowNsfw.toString()}`),
        method: 'POST',
        headers: {
          Authorization: fapi,
          'content-type': 'application/json'
        },
        settings: {
          timeout: 30000
        },
        body: {
          args: {
            text: url
          }
        }
      }).then(async (v) => await v.body());
    }

    public async runSandboxedCode (language: string, code: string): Promise<CodeResult> {
      return await this.sendRequest({
        method: 'POST',
        headers: {
          Authorization: gocode
        },
        settings: {
          timeout: 60000
        },
        body: {
          lang: language,
          code: code,
          timeout: '60'
        },
        url: new URL(Endpoints.gocodeit)
      }).then(async (v) => JSON.parse(await v.body()));
    }

    public async getLanguageList (): Promise<CodeList> {
      return await this.sendRequest({
        method: 'OPTIONS',
        url: new URL(Endpoints.gocodeit),
        settings: {
          timeout: 1000
        },
        headers: {
          Authorization: gocode
        }
      }).then(async (v) => await v.text());
    }

    public async searchZx8Hosts (query: string, limit: number = 1): Promise<Dataset[]> {
      return await this.sendRequest({
        method: 'GET',
        url: new URL(`${Endpoints.zx8}/search`),
        settings: {
          timeout: 5000
        },
        body: {
          query,
          limit
        }
      }).then(async (v) => await v.body());
    }

    public async getZx8Host (query: string): Promise<Dataset> {
      return await this.searchZx8Hosts(query).then((v: Dataset[]) => v[0]);
    }

    public async getZx8Nodes (): Promise<Node[]> {
      return await this.sendRequest({
        method: 'GET',
        url: new URL(`${Endpoints.zx8}/nodes`),
        settings: {
          timeout: 5000
        }
      }).then(async (v) => await v.body());
    }

    public async getZx8Info (): Promise<Zx8Info> {
      return await this.sendRequest({
        method: 'GET',
        url: new URL(`${Endpoints.zx8}/info`),
        settings: {
          timeout: 5000
        }
      }).then(async (v) => await v.body());
    }

    public async ocr (imageUrl: string) {
      return await this.assyst.customRest.sendRequest({
        url: new URL(`${Endpoints.ocr}?q=${imageUrl}`),
        settings: {
          timeout: 7000
        },
        method: 'GET'
      }).then(async (v) => await v.body());
    }

    public async identify (imageUrl: string) {
      return await this.sendRequest({
        url: new URL(Endpoints.identify),
        body: {
          Type: 'CaptionRequest',
          Content: imageUrl
        },
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST',
        settings: {
          timeout: 7000
        }
      }).then(async (v) => await v.text());
    }

    public async getHistory (month: string, day: string): Promise<HistoryApiResult> {
      return await await this.sendRequest({
        url: new URL(`https://byabbe.se/on-this-day/${month}/${day}/events.json`),
        method: 'GET',
        settings: {
          timeout: 5000
        }
      }).then(async (v) => await v.body());
    }

    public async sendRequest (options: RequestOptions) {
      return await new Request(options).send();
    }
}
