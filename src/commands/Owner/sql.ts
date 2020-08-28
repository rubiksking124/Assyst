import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { admins } from '../../../config.json';

import { inspect } from 'util';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'sql',
  aliases: ['db'],
  responseOptional: true,
  metadata: {
    description: 'Execute SQL on the database',
    usage: '[query]',
    examples: ['select now()']
  },
  onBefore: (assyst: Assyst, ctx: Context) => ctx.client.isOwner(ctx.userId) || admins.includes(<never>ctx.userId),
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    let result;
    try {
      result = await assyst.db.sql(args.sql);
    } catch (e) {
      return ctx.editOrReply(e.message);
    }
    const rows = inspect(result.rows);
    return ctx.editOrReply(Markup.codeblock(rows, { limit: 1990, language: 'js' }));
  }
};
