import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import os from 'os';

import { short } from 'git-rev-sync';

import { version, homepage } from '../../../package.json';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'info',
  aliases: ['stats'],
  responseOptional: true,
  metadata: {
    description: 'Get info about the bot',
    usage: '',
    examples: [''],
    minArgs: 0
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const commitHash: string = short();
    const memoryUsage: string = (process.memoryUsage().rss / 1000 / 1000).toFixed(2);
    const guildCount: number = ctx.client.guilds.size;
    const uptime = assyst.utils.elapsed(process.uptime() * 1000);
    const processor: string = `${os.cpus().length}x ${os.cpus()[0].model}`;
    const gitRepo: string = homepage;
    const supportLink: string = 'https://jacher.io/assyst';
    const dbSize: string = await assyst.sql('select pg_size_pretty(pg_database_size(\'assyst\'))').then(r => r.rows[0].pg_size_pretty);

    const countsString = assyst.utils.formatMetricList([
      { name: 'Guilds:', value: guildCount.toString() },
      { name: 'Events:', value: `${(assyst.metrics.eventRate / 60).toFixed(1).toString()}/sec (avg)` },
      { name: 'Commands:', value: `${assyst.metrics.commands.toString()} ran (all time)` }
    ]);

    const statsString = assyst.utils.formatMetricList([
      { name: 'Uptime:', value: `${uptime.days}d, ${uptime.hours}h, ${uptime.minutes}m, ${uptime.seconds}s` },
      { name: 'Processor:', value: `"${processor}"` },
      { name: 'Memory:', value: `${memoryUsage}MB` },
      { name: 'Version:', value: version },
      { name: 'Commit:', value: commitHash },
      { name: 'DB:', value: dbSize }
    ], 11);

    return ctx.editOrReply({
      embed: {
        title: 'Assyst Information',
        description: `[Git](${gitRepo}) | [Invite](${ctx.application?.oauth2UrlFormat({ scope: 'bot', permissions: 0 })}) | [Support](${supportLink})`,
        color: 0xf4632e,
        fields: [
          {
            name: 'Counts',
            value: Markup.codeblock(countsString, { language: 'ml' }),
            inline: false
          },
          {
            name: 'Stats',
            value: Markup.codeblock(statsString, { language: 'ml' }),
            inline: false
          }
        ]
      }
    });
  }
};
