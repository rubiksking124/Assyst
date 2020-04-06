import Assyst, { Metric } from './Assyst';
import { Pool, QueryResult } from 'pg';
import { Context } from 'detritus-client/lib/command';

interface Tag {
    name: string,
    content: string,
    author: string,
    uses: number
}

interface DatabaseAuth {
    host: string,
    user: string,
    password: string,
    database: string,
    port: number
}

interface FoundCommandRow {
    uses: number,
    command: string
}

export default class Database {
    private assyst: Assyst;
    private db: Pool

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

    public async updateCommandUsage (ctx: Context): Promise<void> {
      if (!ctx.command) return;
      const registeredCommandUses: FoundCommandRow[] = await this.sql('select command, uses from command_uses where guild = $1', [ctx.guildId]).then((r: QueryResult) => r.rows);
      this.assyst.metrics.commands++;
      const foundCommand: FoundCommandRow | undefined = registeredCommandUses.find((c: FoundCommandRow) => c.command === ctx.command?.name);
      if (!foundCommand) {
        await this.sql('insert into command_uses("guild", "command", "uses") values ($1, $2, $3)', [ctx.guildId, ctx.command?.name, 1]);
      } else {
        foundCommand.uses++;
        await this.sql('update command_uses set uses = $1 where guild = $2 and command = $3', [foundCommand.uses, ctx.guildId, foundCommand.command]);
      }
    }

    public async getGuildPrefix (guildId: string): Promise<string | undefined> {
      const prefix: string | undefined = await this.sql('select prefix from prefixes where guild = $1', [guildId]).then((r: QueryResult) => r.rows[0].prefix);
      return prefix;
    }

    public async updateGuildPrefix (guildId: string, prefix: string): Promise<void> {
      await this.sql('insert into prefixes(prefix, guild) values($1, $2)', [prefix, guildId]);
    }

    public async getMetrics (): Promise<Metric[]> {
      return await this.sql('select * from metrics').then((r: QueryResult) => r.rows);
    }

    public async updateMetrics (commands: number, eventRate: number): Promise<void> {
      this.sql(`update metrics set value = ${commands} where name = 'commands'; update metrics set value = ${eventRate} where name = 'last_event_count'`);
    }
}
