import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import os from 'os';

import fs from 'fs';

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
    const commitHash: string = getCommitHash();
    const memoryUsage: string = (process.memoryUsage().rss / 1000 / 1000).toFixed(2);
    const uptime = assyst.utils.elapsed(process.uptime() * 1000);
    const processor: string = `${os.cpus().length}x ${os.cpus()[0].model}`;
    const gitRepo: string = homepage;
    const supportLink: string = 'https://jacher.io/assyst';
    const dbSize: string = await assyst.db.getDatabaseSize();

    function getCommitHash () {
      const rev = fs.readFileSync('../.git/HEAD').toString();
      if (rev.indexOf(':') === -1) {
        return rev;
      } else {
        return fs.readFileSync(`../.git/${rev.substring(5).trim()}`).toString().substring(0, 7);
      }
    }

    const countsString = assyst.utils.formatMetricList([
      { name: 'Events:', value: `${(assyst.metrics.eventRate / 60).toFixed(1).toString()}/sec (avg)` },
      { name: 'Commands:', value: `${assyst.metrics.commands.toString()} ran (all time)` }
    ]);

    const statsString = assyst.utils.formatMetricList([
      { name: 'Uptime:', value: `${uptime.days}d, ${uptime.hours}h, ${uptime.minutes}m, ${uptime.seconds}s` },
      { name: 'Processor:', value: `"${processor}"` },
      { name: 'Memory:', value: `${memoryUsage}MB` },
      { name: 'Version:', value: version },
      { name: 'Commit:', value: commitHash },
      { name: 'DB:', value: dbSize },
      { name: 'Node:', value: process.version }
    ], 11);

    return ctx.editOrReply({
      embed: {
        title: 'Assyst Information',
        description: `[Git](${gitRepo}) | [Invite](${ctx.application?.oauth2UrlFormat({ scope: 'bot', permissions: 0 })}) | [Support](${supportLink}) | [Vote](https://top.gg/bot/${ctx.client.user?.id}/vote)`,
        color: 0xf4632e,
        fields: [
          {
            name: 'Counts',
            value: Markup.codeblock(countsString, { language: 'ml' }),
            inline: false
          },
          {
            name: 'Technical information',
            value: Markup.codeblock(statsString, { language: 'ml' }),
            inline: false
          }
        ]
      }
    });
  }
};
