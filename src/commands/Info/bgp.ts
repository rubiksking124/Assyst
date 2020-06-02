import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { unlinkSync, writeFileSync } from 'fs';

import { BaseSet } from 'detritus-client/lib/collections';

const currentQueries: BaseSet<string> = new BaseSet([]);

const headerLine = '"AS      ¦ IP               ¦ BGP Prefix          ¦ CC ¦ Registry ¦ Allocated  ¦ AS Name"';

export default {
  name: 'bgp',
  responseOptional: true,
  metadata: {
    description: 'Perform a whois lookup on ASNs or hosts',
    usage: '[ASN(s)/Host(s)]',
    examples: ['1.1.1.1', 'as206924 1.0.0.1']
  },
  /* ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  }, */
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.bgp) {
      return ctx.editOrReply('You need to provide asn or host argument(s)');
    } else if (currentQueries.has(ctx.userId)) {
      return ctx.editOrReply('You already have an executing whois');
    }

    if (!(/^[a-z0-9.:]+$/i.test(args.bgp))) {
      return ctx.editOrReply('Your query has illegal characters');
    }

    await ctx.triggerTyping();

    if (args.bgp.split(' ').length > 1) {
      const hosts = args.bgp.split(' ').join('\n');
      currentQueries.add(ctx.userId);
      writeFileSync(`./whois_${ctx.userId}`, `begin\n${hosts}\nend`);
      assyst.utils.createExecStream(ctx, `echo ${headerLine} && cat whois_${ctx.userId} | nc bgp.tools 43`, 10000, 5000, () => {
        unlinkSync(`./whois_${ctx.userId}`);
        currentQueries.delete(ctx.userId);
      });
    } else {
      currentQueries.add(ctx.userId);
      assyst.utils.createExecStream(ctx, `whois -h bgp.tools ${args.bgp}`, 5000, 5000, () => { currentQueries.delete(ctx.userId); });
    }
  }
};
