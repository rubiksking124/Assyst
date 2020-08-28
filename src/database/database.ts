import { Pool, QueryResult } from 'pg';
import { BaseCollection, BaseCollectionOptions } from 'detritus-client/lib/collections';

import { Assyst } from '../assyst';
import { ImageScriptTag } from './types';

export interface DatabaseAuth {
    host: string,
    user: string,
    password: string,
    database: string,
    port: number
}

export enum TableNames {
    IMAGESCRIPT_PACKAGES = 'is_packages',
    IMAGESCRIPT_TAGS = 'is_tags',
    PREFIXES = 'prefixes'
}

export class Database {
    static cacheOptions: BaseCollectionOptions = {
      expire: 60000,
      limit: 100
    }

    private assyst: Assyst;
    private db: Pool

    public imageScriptTags: BaseCollection<string, ImageScriptTag> = new BaseCollection<string, ImageScriptTag>(Database.cacheOptions)

    public guildPrefixes: BaseCollection<string, string> = new BaseCollection<string, string>(Database.cacheOptions)

    constructor (assyst: Assyst, db: DatabaseAuth) {
      this.assyst = assyst;
      this.db = new Pool(db);
    }

    public async sql (query: string, values?: any[]): Promise<QueryResult> {
      return new Promise((resolve, reject) => {
        this.db.query(query, values || [], (err: any, res: any) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    }

    public async fetchImageScriptTag (name: string): Promise<ImageScriptTag | undefined> {
      let tag = this.imageScriptTags.get(name);
      if (tag) return tag;
      tag = await this.sql(`select * from ${TableNames.IMAGESCRIPT_TAGS} where name = $1`, [name]).then(res => res.rows[0]);
      if (tag) this.imageScriptTags.set(name, tag);
      return tag;
    }

    public async fetchGuildPrefix (guildId: string): Promise<string | undefined> {
      let prefix = this.guildPrefixes.get(guildId);
      if (prefix) return prefix;
      prefix = await this.sql(`select prefix from ${TableNames.PREFIXES} where guild = $1`, [guildId]).then(res => res.rows[0]);
      if (prefix) this.guildPrefixes.set(guildId, prefix);
      return prefix;
    }

    public async setGuildPrefix (guildId: string, prefix: string): Promise<void> {
      this.guildPrefixes.set(guildId, prefix);
      this.sql(`insert into ${TableNames.PREFIXES}("guild", "prefix") values($1, $2)`, [guildId, prefix]);
    }
}
