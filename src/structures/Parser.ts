import fetch from 'node-fetch';
import { ShardClient } from 'detritus-client';
import { Message, Member, Role } from 'detritus-client/lib/structures';
import Assyst from './Assyst';
import Utils from './Utils';
import { Permissions } from 'detritus-client/lib/constants';

let utils: Utils;
const preParseTags: Array<string> = ['ignore', 'note'];
const postParseTags: Array<string> = ['attach', 'iscript'];
let rexLangs: string[];

/* (async () => {
  rexLangs = await options(new Config().apis.code)
    .accept('application/json')
    .set('Authorization', tokens.gocodeit)
    .then((v: any) => JSON.parse(v.text).data);
})(); */

export default class Parser {
    private assyst: Assyst
    private client: ShardClient;
    private context: { message: Message, getMemberFromString: Function };
    private stackSize: number;
    private rexCalls: number;
    private hasteCalls: number;
    private attachments: { url: string, name: string }[];
    private imagescripts: { script: string, name: string }[];
    private nsfw: boolean;
    private variables: Map<string, string>
    private lastIfResult: boolean = false
    private totalRepeats: number
    private repeatLimit: number
    private parseLimit: number
    private parsedStatements: number

    constructor (client: ShardClient, context: { message: Message, getMemberFromString: Function }, assyst: Assyst) {
      this.client = client;
      this.context = context;
      this.assyst = assyst;

      this.stackSize = 0;
      this.rexCalls = 0;
      this.hasteCalls = 0;

      this.attachments = [];
      this.imagescripts = [];

      this.totalRepeats = 0;
      this.repeatLimit = 2000;

      this.parseLimit = 1000;
      this.parsedStatements = 0;

      this.nsfw = false;
      utils = new Utils(this.assyst);
      this.variables = new Map();
    }

    async parse (input: string, tagArgs: string[], tag: any /* todo */) {
      try {
        const result: string = await this.subParse(input, tagArgs, tag, false, true);
        return { success: true, nsfw: this.nsfw, attachments: this.attachments, imagescripts: this.imagescripts, result: Parser.unescapeTag(result).replace(/\\{/g, '{').replace(/\\}/g, '}') };
      } catch (err) {
        return { success: false, nsfw: false, attachments: [], imagescripts: [], result: `:warning: ${err.message}` };
      }
    }

    async subParse (input: string, tagArgs: string[], tag: any, filter: string[] | false, initial: boolean | undefined): Promise<string> {
      if (this.parsedStatements > this.parseLimit) {
        return input;
      }

      this.stackSize++;
      if (this.stackSize > 1000) { throw new Error(`Stack size exceeded at: \`${input}\``); }

      if (input.length > 10000) { throw new Error(`Memory exceeded at: \`${input}\``); }

      if (initial && this.parsedStatements < this.parseLimit) input = await this.subParse(input, tagArgs, tag, preParseTags, undefined);

      let tagEnd, tagStart;

      for (let i = 0; i < input.length; i++) {
        if (input[i] === '}' && (input[i + 1] !== '\\' && input[i - 1] !== '\0') && this.parsedStatements < this.parseLimit) {
          tagEnd = i;

          for (let e = tagEnd; e >= 0; e--) {
            if (input[e] === '{' && (input[i - 1] !== '\\' && input[e + 1] !== '\0') && this.parsedStatements < this.parseLimit) {
              tagStart = e + 1;

              const toParse: string = input.slice(tagStart, tagEnd).trim();

              const split: string[] = toParse.split(':');
              const tagName: string | undefined = split.shift();

              if (tagName && filter && !filter.includes(tagName)) continue;
              if (tagName && !filter && postParseTags.includes(tagName)) continue;

              const rawArgs = split.join(':').replace(/\\\|/g, '\0|');
              const args = [];

              let currentArg = '';
              for (let i = 0; i < rawArgs.length; i++) {
                if (rawArgs[i] === '|' && rawArgs[i - 1] !== '\0') {
                  args.push(currentArg);
                  currentArg = '';
                } else currentArg += rawArgs[i];
              }

              if (currentArg) args.push(currentArg);

              const before = input.substring(0, tagStart - 1);
              const after = input.substring(tagEnd + 1, input.length);

              const tagResult = Parser.escapeTag(((await this.getData(<string>tagName, rawArgs, args, tagArgs, tag)) || '').toString());

              input = before + tagResult + after;
              i = before.length + tagResult.length - 1;
              break;
            }
          }
        }
      }

      if (initial && this.parsedStatements < this.parseLimit) input = await this.subParse(input, tagArgs, tag, postParseTags, undefined);

      return input;
    }

    async getData (key: string, rawArgs: string, splitArgs: string[], args: string[], tag: any) {
      this.parsedStatements++;
      if (this.parsedStatements > this.parseLimit) return rawArgs;
      key = key.trim();
      rawArgs = rawArgs.trim();
      splitArgs = splitArgs.map(arg => arg.trim());
      switch (key) {
        case 'user':
        case 'username': {
          const member = rawArgs ? this.context.getMemberFromString(rawArgs, this.context.message.channel?.guild) : (this.context.message && this.context.message.member);
          return member ? member.user.username : '';
        }

        case 'discrim':
        case 'discriminator': {
          const member = rawArgs ? this.context.getMemberFromString(rawArgs, this.context.message.channel?.guild) : (this.context.message && this.context.message.member);
          return member ? member.user.discriminator : '';
        }

        case 'tag':
        case 'mention': {
          const member = rawArgs ? this.context.getMemberFromString(rawArgs, this.context.message.channel?.guild) : (this.context.message && this.context.message.member);
          return member ? member.user.tag : '';
        }

        case 'id':
        case 'userid': {
          const member = rawArgs ? this.context.getMemberFromString(rawArgs, this.context.message.channel?.guild) : (this.context.message && this.context.message.member);
          return member && member.user.id;
        }

        case 'avatar': {
          const member = rawArgs ? this.context.getMemberFromString(rawArgs, this.context.message.channel?.guild) : (this.context.message && this.context.message.member);
          return member.user.avatarUrl || '';
        }

        case 'avatarhash': {
          const member = rawArgs ? this.context.getMemberFromString(rawArgs, this.context.message.channel?.guild) : (this.context.message && this.context.message.member);
          return member.user.avatar || '';
        }

        case 'randuser':
          return this.context.message && (this.context.message.guild ? Array.from(this.context.message.guild.members.values())[Math.floor(Math.random() * Array.from(this.context.message.guild.members.values()).length)].username : this.context.message.author.username);

        case 'randchannel':
          return this.context.message && `#${this.context.message.guild ? Array.from(this.context.message.guild.channels.values())[Math.floor(Math.random() * Array.from(this.context.message.guild.channels.values()).length)].name : this.context.message.author.username}`;

        case 'tagname':
          return tag.name;

        case 'tagowner':
          return (await this.client.users.get(tag.owner))?.username;

        case 'dm':
          if (!this.context.message) return 'N/A';
          return this.context.message.guild ? 0 : 1;

        case 'channels':
          if (!this.context.message || !this.context.message.guild) return 'N/A';
          return this.context.message.guild.channels.size;

        case 'members':
        case 'servercount':
          if (!this.context.message || !this.context.message.guild) return 'N/A';
          return this.context.message.guild.memberCount;

        case 'messageid':
          if (!this.context.message) return 'N/A';
          return this.context.message.id;

        case 'owner':
          if (!this.context.message || !this.context.message.guild) return 'N/A';
          return this.context.message.guild.owner?.username;

        case 'serverid':
          if (!this.context.message || !this.context.message.guild) return 'N/A';
          return this.context.message.guild.id;

        case 'server':
          if (!this.context.message || !this.context.message.guild) return 'N/A';
          return this.context.message.guild.name;

        case 'serversize': {
          return this.context.message.guild?.memberCount.toString();
        }

        case 'haspermission':
        case 'hasperm': {
          if (splitArgs.length === 0 || !this.context.message.guild || !this.context.message.member) return null;
          const permission: string = splitArgs[0];
          let user: Member;
          if (!splitArgs[1]) user = this.context.message.member;
          else user = this.context.getMemberFromString(splitArgs[1], this.context.message.guild);

          if (user === undefined) return;

          try {
            const hasPermission: boolean = this.context.message.guild?.can(permission, user);
            return hasPermission.toString();
          } catch (e) {
            return e.message;
          }
        }

        case 'permconvert': {
          return Object(Permissions)[<string>rawArgs.toString()] || '';
        }

        case 'hasrole': {
          let member: Member;
          if (!this.context.message.member) return;
          if (splitArgs[1]) {
            member = this.context.getMemberFromString(splitArgs[1], this.context.message.guild);
            if (!member) return;
          } else {
            member = this.context.message.member;
          }
          return member.roles.map((i: Role | null) => i?.name).includes(splitArgs[0]).toString();
        }

        case 'created': {
          if (splitArgs.length === 0) return;
          if (splitArgs[0] === 'channel') return this.context.message.channel?.createdAt.toLocaleString();
          else if (splitArgs[0] === 'server' || splitArgs[0] === 'guild') return this.context.message.guild?.createdAt.toLocaleString();
          else return;
        }

        case 'channelid':
          if (!this.context.message) return 'N/A';
          return this.context.message.channel?.id;

        case 'channel':
          if (!this.context.message) return 'N/A';
          return this.context.message.channel?.name;

        case 'nick':
        case 'nickname': {
          const member = rawArgs ? this.context.getMemberFromString(rawArgs, this.context.message.channel?.guild) : (this.context.message && this.context.message.member);
          return member && (member.nick || member.user.username);
        }

        case 'me':
          return this.client.user?.username;

          /* case 'prefix':
          return (this.context.message && this.assyst.config.defaultPrefix) || 'N/A'; */

        case 'range': {
          const lower: number = Math.min(...splitArgs.map((i: string) => parseInt(i))) || 0;
          const upper: number = Math.max(...splitArgs.map((i: string) => parseInt(i))) || 0;
          return Math.round(Math.random() * (upper - lower)) + lower;
        }

        case 'repeat': {
          if (isNaN(parseInt(splitArgs[0]))) return;
          let amtOfRepeats: number;
          if (parseInt(splitArgs[0]) > this.repeatLimit) amtOfRepeats = this.repeatLimit;
          else if (parseInt(splitArgs[0]) + this.totalRepeats > this.repeatLimit) amtOfRepeats = this.repeatLimit - (parseInt(splitArgs[0]) + this.totalRepeats);
          else if (this.totalRepeats >= this.repeatLimit) amtOfRepeats = 1;
          else amtOfRepeats = parseInt(splitArgs[0]);
          return splitArgs[1].repeat(amtOfRepeats);
        }

        case 'random':
        case 'choose':
          return splitArgs[Math.floor(Math.random() * splitArgs.length)];

        case 'select': {
          if (isNaN(parseInt(splitArgs[0]))) return;
          const index: number = parseInt(<string>splitArgs.shift());
          return splitArgs[index];
        }

        case 'set': {
          this.variables.set(<string>splitArgs.shift(), splitArgs.join(':'));
          return;
        }

        case 'get': {
          return this.variables.get(<string>splitArgs.shift()) || '';
        }

        case 'attach':
        case 'file':
          if (!splitArgs.length) return;
          this.attachments.push({ url: splitArgs[0], name: splitArgs[1] });
          return;

        case 'iscript':
        case 'imagescript':
          if (!splitArgs.length) return 'https://gitlab.com/snippets/1736663';
          this.imagescripts.push({ script: splitArgs[0], name: splitArgs[1] });
          return;

        case 'note':
          return;

        case 'eval':
          if (this.parseLimit > this.parsedStatements) return await this.subParse(rawArgs.replace(/\0/g, ''), args, tag, false, undefined);
          else return rawArgs;

        case 'args':
          return args.join(' ');

        case 'argsfrom': {
          if (isNaN(parseInt(splitArgs[0]))) return;
          const cargs = args.slice(parseInt(splitArgs[0]) - 1);
          return cargs.join(' ');
        }

        case 'argindex': {
          return args.indexOf(splitArgs[0]) + 1;
        }

        case 'argsto': {
          if (isNaN(parseInt(splitArgs[0]))) return;
          const cargs = args.slice(0, parseInt(splitArgs[0]));
          return cargs.join(' ');
        }

        case 'argsrange': {
          if (isNaN(parseInt(splitArgs[0])) || isNaN(parseInt(splitArgs[1]))) return;
          const cargs = args.slice(parseInt(splitArgs[0]) - 1, parseInt(splitArgs[1]));
          return cargs.join(' ');
        }

        case 'arg': {
          if (isNaN(parseInt(splitArgs[0]))) return;
          const index = parseInt(splitArgs[0]);
          return args[index];
        }

        case 'argslen':
        case 'argslength':
        case 'argscount':
          return args.length;

        case 'replace': {
          const [replace, replacement, text] = splitArgs;
          return (text || '').replace(new RegExp(replace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement || '');
        }

        case 'replaceregex': {
          const [replace, replacement, text, flags] = splitArgs;
          return (text || '').replace(new RegExp(replace, flags || 'g'), replacement || '');
        }

        case 'upper':
          return rawArgs.toUpperCase();

        case 'lower':
          return rawArgs.toLowerCase();

        case 'trim':
          return rawArgs.trim();

        case 'length':
          return rawArgs.length;

        case 'url':
          return encodeURI(rawArgs);

        case 'urlc':
        case 'urlcomponent':
          return encodeURIComponent(rawArgs);

        case 'date':
        case 'time': {
          const format: string = splitArgs[0];
          let offset: number;
          const timeOverride: string = splitArgs[2];
          offset = parseInt(splitArgs[1]);
          if (!format) return '';

          offset = offset ? Parser.timespanToMillis(offset.toString()) : 0;

          const time = (timeOverride ? parseInt(timeOverride) : Date.now()) + offset;
          const date = new Date(time);

          if (!date.valueOf()) return '';
          if (['unix', 'ms'].includes(format)) return date.valueOf();

          const fullMonth = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getUTCMonth()];
          const abbrMonth = fullMonth.slice(0, 3);

          const fullDoW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()];
          const abbrDoW = fullDoW.slice(0, 3);

          let result = '';

          const getReplacement = (match: string) => {
            switch (match) {
              case 'CCCC':
                return Math.floor(date.getUTCFullYear() / 100) + 1;
              case 'YYYY':
                return date.getUTCFullYear();
              case 'YY':
                return date.getUTCFullYear().toString().slice(-2);
              case 'MMMM':
                return fullMonth;
              case 'MMM':
                return abbrMonth;
              case 'MM':
                return `${date.getUTCMonth() < 9 ? '0' : ''}${date.getUTCMonth() + 1}`;
              case 'M':
                return date.getUTCMonth() + 1;
              case 'DDDD':
                return fullDoW;
              case 'DDD':
                return abbrDoW;
              case 'DD':
                return `${date.getUTCDate() < 10 ? '0' : ''}${date.getUTCDate()}`;
              case 'D':
                return date.getUTCDate();
              case 'hh':
                return `${date.getUTCHours() < 10 ? '0' : ''}${date.getUTCHours()}`;
              case 'h':
                return date.getUTCHours();
              case 'mm':
                return `${date.getUTCMinutes() < 10 ? '0' : ''}${date.getUTCMinutes()}`;
              case 'm':
                return date.getUTCMinutes();
              case 'ssss':
                return date.getUTCMilliseconds();
              case 'ss':
                return `${date.getUTCSeconds() < 10 ? '0' : ''}${date.getUTCSeconds()}`;
              case 's':
                return date.getUTCSeconds();
              default:
                return match;
            }
          };

          for (const match of <string[]>format.match(/(C|Y|M|D|h|m|s)\1+|./g)) { result += getReplacement(match); }

          return result;
        }

        case 'joined':
        case 'jointime': {
          const member: Member = splitArgs[1] ? this.context.getMemberFromString(splitArgs[1], this.context.message.channel?.guild) : (this.context.message && this.context.message.member);
          if (!member) return '';

          if (splitArgs[0] === 'discord') { return member.createdAt.toLocaleString(); } else if (splitArgs[0] === 'server') { return member.joinedAt?.toLocaleString(); } else if (splitArgs[0] === 'discordunix') { return member.user.createdAtUnix; } else if (splitArgs[0] === 'serverunix') { return member.joinedAtUnix; } else return '';
        }

        case 'abs':
        case 'absolute': {
          if (isNaN(parseInt(rawArgs))) return;
          return Math.abs(parseFloat(rawArgs));
        }

        case 'pi':
          return Math.PI;

        case 'e':
          return Math.E;

        case 'min':
          return Math.min(...splitArgs.map((i: string) => parseInt(i)));

        case 'max':
          return Math.max(...splitArgs.map((i: string) => parseInt(i)));

        case 'round':
          return Math.round(parseInt(rawArgs));

        case 'ceil':
          return Math.ceil(parseInt(rawArgs));

        case 'floor':
          return Math.floor(parseInt(rawArgs));

        case 'sign':
          return Math.sign(parseInt(rawArgs));

        case 'sin':
          return Math.sin(parseInt(rawArgs));

        case 'cos':
          return Math.cos(parseInt(rawArgs));

        case 'tan':
          return Math.tan(parseInt(rawArgs));

        case 'sqrt':
          return Math.sqrt(parseInt(rawArgs));

        case 'root': {
          if (isNaN(parseInt(splitArgs[0]))) return;
          if (isNaN(parseInt(splitArgs[1]))) return;

          const root: number = parseFloat(<string>splitArgs.shift());
          const num: number = parseFloat(<string>splitArgs.shift());

          return num ** (1 / root);
        }

        case 'math': {
          if (/[^+\-*^/()0-9.% ]/g.test(rawArgs)) throw new Error(`Invalid term \`${rawArgs}\``);
          try {
            // eslint-disable-next-line no-eval
            return eval(rawArgs.replace(/\^/g, '**').replace(/([^\d]?)0(\d+)/g, (match, b, a) => b + a)).toString();
          } catch (err) {
            throw new Error(`Failed to calculate term \`${rawArgs}\``);
          }
        }

        case 'if': {
          const value: string | undefined = splitArgs.shift();
          const operator: string | undefined = splitArgs.shift();
          const compareValue: string | undefined = splitArgs.shift();
          let onMatch, onNoMatch;

          for (const part of splitArgs) {
            const splitPart = part.split(':');
            const action = splitPart.shift();
            if (action === 'then') onMatch = splitPart.join(':');
            if (action === 'else') onNoMatch = splitPart.join(':');
          }

          const result: boolean = Parser.compareLogic(<string>value, <string>compareValue, <string>operator);
          this.lastIfResult = result;
          return result ? onMatch : onNoMatch;
        }

        case 'then':
          if (this.lastIfResult === undefined) return '';
          return this.lastIfResult ? rawArgs : '';

        case 'else':
          if (this.lastIfResult === undefined) return '';
          return this.lastIfResult ? '' : rawArgs;

        case 'codeblock':
          return `\`\`\`${rawArgs.replace(/`/g, '`\u200b')}\`\`\``;

        case 'code':
          return `\`${rawArgs.replace(/`/g, '')}\``;

        case 'bold':
          return `**${rawArgs.replace(/\*{2}/g, '')}**`;

        case 'strikethrough':
          return `~~${rawArgs.replace(/~/g, '')}~~`;

        case 'limit':
          return (splitArgs[0] || '').slice(0, parseInt(splitArgs[1]) || 2000);

        case 'ignore':
          return Parser.escapeTag(rawArgs);

        case 'nsfw':
          if (rawArgs === 'test') return 'nsfw';
          this.nsfw = true;
          return '';

        case 'ping':
          return Math.round((await this.client.ping()).gateway);

        case 'haste':
        /* case 'files.gg': {
          this.hasteCalls++;
          if (this.hasteCalls > 5) return '[TOO MANY HASTE CALLS]';

          const keyMatch = rawArgs.match(/^(https?:\/\/wrmsr\.io\/)?([a-z0-9]{8,12})$/i);
          if (keyMatch) return await Parser.retrieveHaste(keyMatch[keyMatch.length - 1]);
          else return await Parser.createHaste(rawArgs);
        } */

        /* default:
          if (rexLangs.includes(key)) {
            if (!rawArgs) return;

            this.rexCalls++;
            if (this.rexCalls > 2) return '[TOO MANY REX CALLS]';

            const rexResult = await this.assyst.utils.runSandboxedCode(key, Parser.unescapeTag(rawArgs));

            return Parser.escapeTag(rexResult.data.res);
          }
          this.parsedStatements--;
          return `{${key}${rawArgs ? `:${rawArgs}` : ''}}`; */
      }
    }

    static timespanToMillis (timespan: string) {
      if (!timespan) return 0;

      let offset = 0;

      const months = Parser.extractNumber(timespan.match(/(\d+)mo/g));
      const millis = Parser.extractNumber(timespan.match(/(\d+)ms/g));

      const years = Parser.extractNumber(timespan.match(/(\d+)y/g));
      const weeks = Parser.extractNumber(timespan.match(/(\d+)w/g));
      const days = Parser.extractNumber(timespan.match(/(\d+)d/g));
      const hours = Parser.extractNumber(timespan.match(/(\d+)h/g));
      const minutes = Parser.extractNumber(timespan.match(/(\d+)m[^s]?/g));
      const seconds = Parser.extractNumber(timespan.match(/(\d+)s/g));

      offset += millis;
      offset += seconds * 1000;
      offset += minutes * 60 * 1000;
      offset += hours * 60 * 60 * 1000;
      offset += days * 24 * 60 * 60 * 1000;
      offset += weeks * 7 * 24 * 60 * 60 * 1000;
      offset += months * 30 * 24 * 60 * 60 * 1000;
      offset += years * 365 * 24 * 60 * 60 * 1000;

      if (timespan[0] === '-') offset *= -1;

      return offset;
    }

    static extractNumber (matches: RegExpMatchArray | null) {
      return (matches || [])
        .map(val => {
          return (val
            .match(/\d+/g) || [])[0];
        })
        .reduce((prev, curr) => prev + parseInt(curr), 0);
    }

    static compareLogic (value: string, compareValue: string, operator: string) {
      switch (operator) {
        case '=':
        case '==':
          return value === compareValue; // equal

        case '!':
        case '!=':
          return value !== compareValue; // not equal

        case '~':
          return (value || '').toLowerCase() === (compareValue || '').toLowerCase(); // equal ignore case

        case '>':
          return value > compareValue; // gt

        case '<':
          return value < compareValue; // lt

        case '>=':
          return value >= compareValue; // gt or equal

        case '<=':
          return value <= compareValue; // lt or equal

        case '?': {
          const regex = new RegExp(compareValue);
          return regex.test(value); // regex match
        }

        default:
          throw new Error(`Invalid if operator: \`${operator}\``);
      }
    }

    static escapeTag (tag: string) {
      return tag.replace(/{/g, '{\0').replace(/}/g, '\0}').replace(/\|/g, '\0|');
    }

    static unescapeTag (tag: string) {
      return tag.replace(/\0/g, '');
    }

    /* static async createHaste (content: string) {
      const res = await utils.uploadToFilesGG(content, 'paste.txt');
      return res;
    } */

    static async retrieveHaste (key: string) {
      const { data } = await fetch(`https://wrmsr.io/documents/${key}`).then(res => res.json());
      return data === undefined ? '[HASTE NOT FOUND]' : data;
    }
}
