import ClientBase from '../ClientBase';

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

export default class Zx8RestClient extends ClientBase {
  constructor () {
    super({
      authKey: undefined,
      clientName: 'zx8',
      baseUrl: 'https://zx8.jacher.io',
      version: 'v1'
    });
  }

  public async searchHosts (query: string, limit: number = 1): Promise<Dataset[]> {
    return await <Promise<Dataset[]>> this.controller.request({
      method: 'GET',
      path: `api/${this.version}/host`,
      url: this.baseUrl,
      query: {
        url: query,
        limit
      }
    });
  }

  public async getHost (query: string): Promise<Dataset> {
    return this.searchHosts(query).then((v: Dataset[]) => v[0]);
  }

  public async getNodes (): Promise<Node[]> {
    return await <Promise<Node[]>> this.controller.request({
      method: 'GET',
      path: `api/${this.version}/nodes`,
      url: this.baseUrl
    });
  }

  public async getInfo (): Promise<Zx8Info> {
    return await <Promise<Zx8Info>> this.controller.request({
      method: 'GET',
      path: `api/${this.version}/info`,
      url: this.baseUrl
    });
  }
}
