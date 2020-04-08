import ClientBase from '../ClientBase';

import { Request } from 'detritus-rest';

import { gocode } from '../../../config.json';

export interface CodeList {
    status: number,
    data: Array<string>
  }

export interface CodeResult {
    data: {
        res: string,
        comp: number,
        timings: any[]
    },
    status: number
  }
export default class GocodeitRestClient extends ClientBase {
  constructor () {
    super({
      authKey: undefined,
      clientName: 'gocodeit',
      baseUrl: 'api.gocode.it'
    });
  }

  public async runSandboxedCode (language: string, code: string): Promise<CodeResult> {
    return await new Request({
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
      url: new URL('https://api.gocode.it/exec/')
    }).send().then(async (v: any) => {
      const text = await v.text();
      return JSON.parse(text);
    });
  }

  public async getLanguageList (): Promise<CodeList> {
    return await new Request({
      method: 'OPTIONS',
      url: new URL('https://api.gocode.it/exec/'),
      settings: {
        timeout: 1000
      },
      headers: {
        Authorization: gocode
      }
    }).send().then(async (v) => JSON.parse(await v.text()));
  }
}
