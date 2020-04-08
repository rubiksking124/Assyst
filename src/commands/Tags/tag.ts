import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'tag',
  aliases: [''],
  responseOptional: true,
  metadata: {
    description: '',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: '',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {

  }
};
