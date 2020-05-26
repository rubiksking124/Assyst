import Assyst from '../structures/Assyst';

import {
  dbl,
  discordbotlist,
  fapi,
  gocode,
  yandex
} from '../../config.json';

import { ShardClient } from 'detritus-client';

import Endpoints from './Endpoints';
import DefaultHeaders from './DefaultHeaders';

import { Request, RequestOptions } from 'detritus-rest';
import { Member, Role } from 'detritus-client/lib/structures';

import * as Types from './Types';

export default class RestController {
    public assyst: Assyst
    private defaultTimeout: number = 15000

    constructor (assyst: Assyst) {
      this.assyst = assyst;
    }

    private async translateRaw (text: string, language: string): Promise<Types.Translate.RawTranslation> {
      return await this.sendRequest({
        method: 'GET',
        settings: {
          timeout: 15000
        },
        url: new URL(`${Endpoints.translate}?text=${encodeURIComponent(text)}&lang=${language}&key=${yandex}`)
      }).then(async (v) => await v.json());
    }

    public async translate (text: string, limit: number = 6): Promise<Types.Translate.Translation> {
      const chain: Array<string> = [];
      for (let i = 0; i < limit; ++i) {
        const targetLanguage = i === limit - 1 ? 'en' : Types.Translate.Languages[Math.floor(Math.random() * Types.Translate.Languages.length)];
        if (!targetLanguage) break;
        text = await this.translateRaw(text, targetLanguage).then(res => {
          if (res.code !== 200) {
            return text;
          } else {
            chain.push(targetLanguage);
            return res.text[0];
          }
        });
      }
      return { chain, text };
    }

    public async searchGitHubRepository (query: string, options: Types.GitHub.Repository.SearchOptions = {}): Promise<Types.GitHub.Repository.SearchResult> {
      return await this.sendRequest({
        url: new URL(`${Endpoints.github.searchRepository}?q=${query}${options.sort ? `&sort=${options.sort}` : ''}${options.order ? `&order=${options.order}` : ''}`),
        method: 'GET',
        settings: {
          timeout: this.defaultTimeout
        },
        headers: DefaultHeaders.github
      }).then(async (v) => await v.json());
    }

    public async searchGitHubUser (query: string, options: Types.GitHub.User.SearchOptions = {}): Promise<Types.GitHub.User.SearchResult> {
      return await this.sendRequest({
        url: new URL(`${Endpoints.github.searchUser}?q=${query}${options.sort ? `&sort=${options.sort}` : ''}${options.order ? `&order=${options.order}` : ''}`),
        method: 'GET',
        settings: {
          timeout: this.defaultTimeout
        },
        headers: DefaultHeaders.github
      }).then(async (v) => await v.json());
    }

    public async fetchGitHubUser (username: string): Promise<Types.GitHub.User.User | Types.GitHub.NotFound> {
      return await this.sendRequest({
        url: new URL(Endpoints.github.user.replace(':username', username)),
        method: 'GET',
        settings: {
          timeout: this.defaultTimeout
        },
        headers: DefaultHeaders.github
      }).then(async (v) => await v.json());
    }

    public async fetchGitHubRepositoryForks (owner: string, repository: string) {
      return await this.sendRequest({
        url: new URL(Endpoints.github.forks.replace(':owner', owner).replace(':repo', repository)),
        method: 'GET',
        settings: {
          timeout: this.defaultTimeout
        },
        headers: DefaultHeaders.github
      }).then(async (v) => await v.json());
    }

    public async fetchGitHubRepositoryCommits (owner: string, repository: string) {
      return await this.sendRequest({
        url: new URL(Endpoints.github.commits.replace(':owner', owner).replace(':repo', repository)),
        method: 'GET',
        settings: {
          timeout: this.defaultTimeout
        },
        headers: DefaultHeaders.github
      }).then(async (v) => await v.json());
    }

    public async fetchMemberPermissionBitfield (member: Member): Promise<number> {
      const r = await this.assyst.rest.fetchGuildRoles(member.guildId);
      return r.filter((v: Role) => member.roles.has(v.id)).map((v: Role) => v.permissions).reduce((a: any, b: any) => a | b);
    }

    public async postStats (): Promise<Types.BotLists.PostResults> {
      const guildCount = await this.assyst.rest.fetchMeGuilds().then(g => g.length);
      const results: Types.BotLists.PostResults = { dbl: null, discordbotlist: null };
      results.dbl = await this.postStatsToTopGG(guildCount);
      results.discordbotlist = await this.postStatsToDiscordBotList(guildCount);
      return results;
    }

    private async postStatsToTopGG (guildCount: number) {
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
          server_count: guildCount,
          shard_count: 1
        }
      }).then(async (v) => await v.text());
    }

    private async postStatsToDiscordBotList (guildCount: number) {
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
          guilds: guildCount
        }
      }).then(async (v) => await v.text());
    }

    public async fetchTopGGBot (botId: string) {
      const responses = await Promise.all([this.fetchTopGGBotInfo(botId), this.fetchTopGGBotStats(botId)]);
      return {
        ...responses[0],
        ...responses[1]
      };
    }

    private async fetchTopGGBotInfo (botId: string) {
      return await this.sendRequest({
        url: new URL(`${Endpoints.topgg}/${botId}`),
        method: 'GET',
        settings: {
          timeout: 5000
        },
        headers: {
          Authorization: dbl
        }
      }).then(async (v) => await v.json());
    }

    private async fetchTopGGBotStats (botId: string) {
      return await this.sendRequest({
        url: new URL(`${Endpoints.topgg}/${botId}/stats`),
        method: 'GET',
        settings: {
          timeout: 5000
        },
        headers: {
          Authorization: dbl
        }
      }).then(async (v) => await v.json());
    }

    public async searchDuckDuckGo (query: string): Promise<Types.DuckDuckGo.Response> {
      return await this.sendRequest({
        url: new URL(Endpoints.fapi.ddg),
        method: 'POST',
        settings: {
          timeout: 15000
        },
        headers: {
          Authorization: fapi
        },
        body: {
          args: {
            text: query
          }
        }
      }).then(async (v) => await v.json());
    }

    public async searchDuckDuckGoImages (query: string, safetyLevel: 1 | -2): Promise<string[]> {
      return await this.sendRequest({
        url: new URL(Endpoints.fapi.ddgimg),
        method: 'POST',
        settings: {
          timeout: 15000
        },
        headers: {
          Authorization: fapi
        },
        body: {
          args: {
            text: query,
            safetyLevel
          }
        }
      }).then(async (v) => await v.json());
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
          timeout: 32000
        },
        body: {
          args: {
            text: url
          }
        }
      }).then(async (v) => await v.body());
    }

    public async runEvalMagik (script: string, imageUrl: string): Promise<string | Buffer> {
      return await this.sendRequest({
        url: new URL(`${Endpoints.fapi.evalmagik}`),
        method: 'POST',
        headers: {
          Authorization: fapi,
          'content-type': 'application/json'
        },
        settings: {
          timeout: 10000
        },
        body: {
          args: {
            text: script
          },
          images: [imageUrl]
        }
      }).then(async (v) => await v.body());
    }

    public async fetchSteamPlaying (game: string): Promise<string> {
      const res = await this.sendRequest({
        url: new URL(`${Endpoints.fapi.steamplaying}`),
        method: 'POST',
        headers: {
          Authorization: fapi,
          'content-type': 'application/json'
        },
        settings: {
          timeout: 10000
        },
        body: {
          args: {
            text: game
          }
        }
      }).then(async (v) => await v.body());
      if (res === 'invalid game??') {
        return 'No game found';
      } else if (res.startsWith('🕹')) {
        return res.replace(/[*]/g, '').slice(3);
      } else {
        return res;
      }
    }

    public async runImageScript (script: string): Promise<Buffer | string> {
      return await this.sendRequest({
        url: new URL(`${Endpoints.fapi.imagescript}`),
        method: 'POST',
        headers: {
          Authorization: fapi,
          'content-type': 'application/json'
        },
        settings: {
          timeout: 10000
        },
        body: {
          args: {
            text: script
          }
        }
      }).then(async (v) => await v.body());
    }

    public async legoifyImage (imageUrl: string, resolution: string) {
      return await this.sendRequest({
        url: new URL(`${Endpoints.fapi.lego}`),
        method: 'POST',
        headers: {
          Authorization: fapi,
          'content-type': 'application/json'
        },
        settings: {
          timeout: 10000
        },
        body: {
          args: {
            text: resolution
          },
          images: [imageUrl]
        }
      }).then(async (v) => await v.body());
    }

    public async runSandboxedCode (language: string, code: string): Promise<Types.GoCodeIt.CodeResult | string> {
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
      }).then(async (v) => {
        try {
          const json = await v.json();
          return json;
        } catch {
          const body = await v.body();
          return body;
        }
      });
    }

    public async getLanguageList (): Promise<Types.GoCodeIt.CodeList> {
      return await this.sendRequest({
        method: 'OPTIONS',
        url: new URL(Endpoints.gocodeit),
        settings: {
          timeout: 1000
        },
        headers: {
          Authorization: gocode
        }
      }).then(async (v) => {
        const body = await v.body();
        let out;
        try {
          out = JSON.parse(body);
        } catch (e) {
          return body;
        }
        return out;
      });
    }

    public async searchZx8Hosts (query: string, limit: number = 1): Promise<Types.Zx8.Dataset[]> {
      return await this.sendRequest({
        method: 'GET',
        url: new URL(`${Endpoints.zx8}/search?query=${query}&limit=${limit}`),
        settings: {
          timeout: 5000
        }
      }).then(async (v) => await v.json());
    }

    public async getZx8Host (query: string): Promise<Types.Zx8.Dataset> {
      return await this.searchZx8Hosts(query).then((v: Types.Zx8.Dataset[]) => v[0]);
    }

    public async getZx8Nodes (): Promise<Types.Zx8.Node[]> {
      return await this.sendRequest({
        method: 'GET',
        url: new URL(`${Endpoints.zx8}/nodes`),
        settings: {
          timeout: 5000
        }
      }).then(async (v) => await v.body());
    }

    public async getZx8Info (): Promise<Types.Zx8.Info> {
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

    public async identify (imageUrl: string): Promise<string> {
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

    public async getHistory (month: string, day: string): Promise<Types.History.ApiResult> {
      return await await this.sendRequest({
        url: new URL(`https://byabbe.se/on-this-day/${month}/${day}/events.json`),
        method: 'GET',
        settings: {
          timeout: 5000
        }
      }).then(async (v) => await v.body());
    }

    public async sendRequest (options: RequestOptions): Promise<any> {
      return await new Request(options).send();
    }
}
