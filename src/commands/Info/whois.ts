import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { unlinkSync, writeFileSync } from 'fs';

import { promisify } from 'util';
import { BaseSet } from 'detritus-client/lib/collections';

const delFile = promisify(unlinkSync);
const createFile = promisify(writeFileSync);

const currentQueries: BaseSet<string> = new BaseSet([]);

const headerLine = 'AS      ¦ IP               ¦ BGP Prefix          ¦ CC ¦ Registry ¦ Allocated  ¦ AS Name';

export default {
  name: 'whois',
  aliases: ['wi'],
  responseOptional: true,
  metadata: {
    description: 'Perform a whois lookup on ASNs or hosts',
    usage: '[ASN(s)/Host(s)]',
    examples: ['1.1.1.1', 'as206924 1.0.0.1']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.whois) {
      return ctx.editOrReply('You need to provide asn or host argument(s)');
    } else if (currentQueries.has(ctx.userId)) {
      return ctx.editOrReply('You already have an executing whois');
    }

    if (!(/[a-zA-Z0-9.]/g.test(args.whois))) {
      return ctx.editOrReply('The query has illegal characters, the valid characters are a-z, 0-9 and .');
    }

    await ctx.triggerTyping();

    if (args.whois.split(' ').length > 1) {
      const hosts = args.whois.split(' ').join('\n');
      currentQueries.add(ctx.userId);
      await writeFileSync(`./whois_${ctx.userId}`, `begin\n${hosts}\nend`);
      assyst.utils.createExecStream(ctx, `echo ${headerLine} && cat whois_${ctx.userId} | nc bgp.tools 43`, 10000, 5000, async () => {
        await delFile(`./whois_${ctx.userId}`);
        currentQueries.delete(ctx.userId);
      });
    } else {
      currentQueries.add(ctx.userId);
      assyst.utils.createExecStream(ctx, `whois -h bgp.tools ${args.whois}`, 5000, 5000, () => currentQueries.delete(ctx.userId));
    }
  }
};
