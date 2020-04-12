import ClientBase from '../ClientBase';

import { fapi } from '../../../config.json';

import { Request } from 'detritus-rest';

import DResponse from 'detritus-rest/lib/response';

export default class FapiRestClient extends ClientBase {
  constructor () {
    super({
      authKey: fapi,
      clientName: 'fapi',
      baseUrl: 'fapi.wrmsr.io'
    });
  }

  public async screenshot (url: string, allowNsfw: boolean): Promise<Buffer | string> {
    return await new Request({
      url: new URL(`https://${this.baseUrl}/screenshot?allow_nsfw=${allowNsfw.toString()}`),
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
    }).send().then(async (v: DResponse.Response) => await v.body());
  }
}
