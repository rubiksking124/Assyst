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

interface CommandUseInfo {
  command: string,
  uses: string
}

export interface ITag {
  id: number,
  name: string,
  author: string,
  createdat: Date,
  nsfw: boolean,
  guild: string,
  uses: number,
  content: string
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

    public async addGuildAdmin (guildId: string, userId: string): Promise<void> {
      await this.sql('insert into guild_admins("guild", "user_id") values($1, $2)', [guildId, userId]);
    }

    // eslint-disable-next-line camelcase
    public async getGuildAdmins (guildId: string): Promise<{user_id: string}[]> {
      return await this.sql('select user_id from guild_admins where guild = $1', [guildId]).then(r => r.rows);
    }

    public async checkIfUserIsGuildAdmin (guildId: string, userId: string): Promise<boolean> {
      const guildAdmins = await this.getGuildAdmins(guildId);
      const users = guildAdmins.map(u => u.user_id);
      return users.includes(userId);
    }

    public async removeGuildAdmin (guildId: string, userId: string): Promise<void> {
      await this.sql('delete from guild_admins where guild = $1 and user_id = $2', [guildId, userId]);
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

    public async updateGuildPrefix (prefix: string, guildId: string): Promise<void> {
      await this.sql('update prefixes set prefix = $1 where guild = $2', [prefix, guildId]).then((r: QueryResult) => r.rows[0] ? r.rows[0].prefix : undefined);
    }

    public async getGuildPrefix (guildId: string): Promise<string | undefined> {
      const prefix: string | undefined = await this.sql('select prefix from prefixes where guild = $1', [guildId]).then((r: QueryResult) => r.rows[0] ? r.rows[0].prefix : undefined);
      return prefix;
    }

    public async getGuildDisabledCommands (guildId: string): Promise<string[]> {
      const rows: { command: string }[] = await this.sql('select command from disabled_commands where guild = $1', [guildId]).then((r: QueryResult) => r.rows);
      if (rows.length === 0) return [];
      else return rows.map(r => r.command);
    }

    public async disableGuildCommand (commandName: string, guildId: string): Promise<void> {
      await this.sql('insert into disabled_commands(command, guild) values ($1, $2)', [commandName, guildId]);
    }

    public async enableGuildCommand (commandName: string, guildId: string): Promise<void> {
      await this.sql('delete from disabled_commands where command = $1 and guild = $2', [commandName, guildId]);
    }

    public async addGuildPrefix (guildId: string, prefix: string): Promise<QueryResult> {
      const res = await this.sql('insert into prefixes("prefix", "guild") values($1, $2)', [prefix, guildId]);
      return res;
    }

    public async getMetrics (): Promise<Metric[]> {
      return await this.sql('select * from metrics').then((r: QueryResult) => r.rows);
    }

    public async updateEventCounts (events: Map<string, number>): Promise<void> {
      const eventTypes = Array.from(events).map(e => e[0]);
      const savedEvents = await this.sql('select * from events').then(r => r.rows);
      const entries: string[] = savedEvents.map(e => e.name);
      eventTypes.forEach(async (entry: string) => {
        if (entries.includes(entry)) {
          // @ts-ignore
          await this.sql('update events set amount = $1 where name = $2', [parseInt(events.get(entry)) + parseInt(savedEvents.find(e => e.name === entry).amount), entry]);
        } else {
          await this.sql('insert into events("name", "amount") values ($1, $2)', [entry, events.get(entry)]);
        }
      });
    }

    public async addUserToFeedbackBlacklist (userId: string): Promise<void> {
      await this.sql('insert into feedback_blacklist("userid") values($1)', [userId]);
    }

    public async getEvents (): Promise<{name: string, amount: string}[]> {
      return await this.sql('select * from events').then(r => r.rows);
    }

    public async updateMetrics (commands: number, eventRate: number): Promise<void> {
      this.sql(`update metrics set value = ${commands} where name = 'commands'; update metrics set value = ${eventRate} where name = 'last_event_count'`);
    }

    public async getDatabaseSize (): Promise<string> {
      return await this.sql('select pg_size_pretty(pg_database_size(\'assyst\'))').then(r => r.rows[0].pg_size_pretty);
    }

    public async getNow (): Promise<string> {
      return await this.sql('select now()').then(r => r.rows[0].now);
    }

    public async getGuildCommandUses (guildId: string): Promise<CommandUseInfo[]> {
      return await this.sql('select command, uses from command_uses where guild = $1 order by uses desc', [guildId]).then((r: QueryResult) => r.rows);
    }

    public async getTag (guildId: string, tagName: string): Promise<ITag | undefined> {
      return await this.sql('select * from tags where name = $1 and guild = $2', [tagName, guildId]).then(r => r.rows[0]);
    }

    public async checkIfUserIsFeedbackBlacklisted (userId: string): Promise<boolean> {
      const users = await this.sql('select userid from feedback_blacklist').then(r => r.rows);
      const ids = users.map(u => u.userid);
      return ids.includes(userId);
    }

    public async setCommandLogChannel (guildId: string, channelId: string): Promise<void> {
      const commandLogChannelExists = await this.sql('select channel from command_logging where guild = $1', [guildId]).then(res => res.rows.length > 0);
      if (!commandLogChannelExists) {
        this.sql('insert into command_logging (guild, channel) values ($1, $2)', [guildId, channelId]);
      } else {
        this.sql('update command_logging set channel = $1 where guild = $2', [channelId, guildId]);
      }
    }

    public async getCommandLogChannel (guildId: string): Promise<string | undefined> {
      return await this.sql('select channel from command_logging where guild = $1', [guildId]).then(r => r.rows[0]?.channel);
    }

    public async deleteCommandLogChannel (guildId: string): Promise<void> {
      await this.sql('delete from command_logging where guild = $1', [guildId]);
    }

    public async createImageScriptTag (name: string, content: string, owner: string) {
      await this.sql('insert into is_tags (name, content, owner, uses) values ($1, $2, $3, 0)', [name, content, owner]);
    }

    public async fetchImageScriptTag (name: string) {
      return this.sql('select * from is_tags where name = $1', [name]).then(r => r.rows);
    }

    public async deleteImageScriptTag (name: string) {
      await this.sql('delete from is_tags where name = $1', [name]);
    }

    public async incrementImageScriptTagUses (name: string) {
      await this.sql('update is_tags set uses = uses + 1 where name = $1', [name]);
    }

    public async editImageScriptTag (name: string, content: string) {
      await this.sql('update is_tags set content = $1 where name = $2', [content, name]);
    }

    public async fetchTopImageScriptTags (limit: number) {
      return await this.sql('select * from is_tags order by uses desc limit $1', [limit]).then(r => r.rows);
    }

    public async fetchUserImageScriptTags (owner: string): Promise<string[]> {
      return await this.sql('select name from is_tags where owner = $1', [owner]).then(r => r.rows.map(i => i.name));
    }
}
