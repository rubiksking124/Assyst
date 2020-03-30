import { Context } from 'detritus-client/lib/command';

import { inspect } from 'util';

import Assyst from '../structures/Assyst';

import { Utils } from 'detritus-client';
const { Markup } = Utils;

export default {
  name: 'help',
  responseOptional: true,
  editOrReply: true,
  onBefore: (context: Context) => context.client.isOwner(context.userId),
  run: async (assyst: Assyst, ctx: Context) => {
    ctx.editOrReply(`there is ${ctx.prefix}eval and that is it`);
  }
};
