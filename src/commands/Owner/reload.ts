import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { admins } from '../../../config.json';

import { execSync } from 'child_process';

export default {
  name: 'reload',
  responseOptional: true,
  metadata: {
    description: 'Reload commands',
    usage: '',
    examples: ['']
  },
  onBefore: (ctx: Context) => { return ctx.client.isOwner(ctx.userId) || admins.includes(ctx.userId); },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    await ctx.editOrReply('reloading');
    execSync('tsc');
    assyst.reloadCommands();
    ctx.editOrReply(`reloaded commands on shard ${ctx.shardId}`);
  }
};
