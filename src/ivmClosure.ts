/* eslint-disable no-global-assign */
/* eslint-disable no-extra-bind */
/* eslint-disable no-extend-native */
// This file is for isolated-vm

declare var $0: any;

const generateSnowflake = () => new Array(19).fill(null).map(() => Math.random() * 9 | 0).join('');
const vowels = ['a', 'e', 'i', 'o', 'u'];
const generateDiscriminator = () => (Math.random() * 9999 | 0).toString().padStart(4, '0');
const generateUsername = () => new Array((Math.random() * 5 | 0) + 5)
  .fill(null)
  .map((_, i) => i % 2 === 0
    ? vowels[Math.random() * vowels.length | 0]
    : (Math.random() > 0.8
      ? (Math.random() * 9 | 0)
      : String.fromCharCode((Math.random() * 25 | 0) + 97))).join('');

// @ts-ignore
global.exec = ((args: string) => {
  if (!args) throw new Error('Invalid script.');
  throw new Error(`Error: Command not found: ${args.split(' ')[0]}`);
}).bind(null);

// @ts-ignore
global.require = function (mod) {
  switch (mod) {
    case 'child_process':
      return {
        // @ts-ignore
        exec: global.exec,
        // @ts-ignore
        execSync: global.exec
      };
    case 'discord.js':
      return {
        client: null,
        version: 'v12.2.0'
      };
    default:
      throw new Error('Cannot find module ' + mod);
  }
}.bind(null);

// @ts-ignore
global.message = {
  reply: (() => {
    return call(5);
  }).bind(null),
  delete: (() => {
    return call(6);
  }).bind(null),
  edit: (() => {
    return call(7);
  }).bind(null),
  id: generateSnowflake(),
  // @ts-ignore
  author: {
    avatar: null,
    bot: false,
    discriminator: generateDiscriminator(),
    id: generateSnowflake(),
    public_flags: 0,
    system: undefined,
    username: generateUsername()
  },
  member: null,
  channel: {
    send: (() => call(12)).bind(null)
  },
  toString: function () {
    // @ts-ignore
    return this;
  }
};

// @ts-ignore
global.process = {
  _exiting: false,
  uptime: (() => {
    return Date.now();
  }).bind(null),
  // @ts-ignore
  exit (code) {
    if (code || code === 0) { process.exitCode = code; }

    if (!(<any>process)._exiting) {
      (<any>process)._exiting = true;
      process.emit('exit', process.exitCode || 0);
    }
    // FIXME(joyeecheung): This is an undocumented API that gets monkey-patched
    // in the user land. Either document it, or deprecate it in favor of a
    // better public alternative.
    (<any>process).reallyExit(process.exitCode || 0);
  },
  reallyExit: ((code: number) => {
    throw new Error('EACCES: permission denied, SIGKILL process pid 15357');
  }).bind(null),
  // @ts-ignore
  emit: ((event: string, value: any) => { return this; }).bind(null),
  version: 'v12.18.0',
  versions: {
    node: '12.18.0',
    v8: '7.8.279.23-node.37',
    uv: '1.37.0',
    zlib: '1.2.11',
    // @ts-ignore
    brotli: '1.0.7',
    ares: '1.16.0',
    modules: '72',
    nghttp2: '1.41.0',
    napi: '6',
    llhttp: '2.0.4',
    http_parser: '2.9.3',
    openssl: '1.1.1g',
    cldr: '37.0',
    icu: '67.1',
    tz: '2019c',
    unicode: '13.0'
  },

  env: {
    TOKEN: 'NTcxNjYxMjIxODU0NzA3NzEz.Dvl8Dw.aKlcU6mA69pSOI_YBB8RG7nNGUE',
    DBL_TOKEN: 'eyJhbGciOiHOI8Nidb3AInR5cCI6IkpXVCJ9.eyJqZCI6IjU3MUZNAiaIyMTg1NDcwNzcxMyIsI57bHSLAOQU826ZSwiaWF0IjoxNTg2MzY3OTgyfQ.euTh8Q-z0aB48nbGHnamcT2YzGv54nSIwn7B6Cmr7sRag'
  }
};

// This unexposed function is called in "REST" functions
// to make it look like it makes an actual API call
function call (k: number) {
  throw new Error('401: Unauthorized');
}

class Collection extends Map {
  // eslint-disable-next-line no-useless-constructor
  constructor (...args: any[]) {
    // @ts-ignore
    super(...args);
  }

  first () {
    return this.values().next().value;
  }

  random () {
    return [...this.values()][Math.random() * this.size | 0];
  }
}

class Channel {
  constructor (data: any) {
    for (const [k, v] of Object.entries(data)) {
      // @ts-ignore
      this[k] = v;
    }
  }

  send () {
    return call(1);
  }

  delete () {
    return call(2);
  }
}

// @ts-ignore
global.fetch = ((u: string) => {
  throw new Error(`request to ${u} failed, reason: getaddrinfo ENOTFOUND ${u}`);
}).bind(null);

(function () {
  const generatorFunctions = {
    users: (id: string) => ({
      avatar: null,
      bot: false,
      discriminator: generateDiscriminator(),
      id,
      public_flags: 0,
      system: undefined,
      username: generateUsername()
    }),
    channels: (id: string) => new Channel({
      id,
      guild_id: generateSnowflake(),
      topic: '',
      type: 0,
      rate_limit_per_user: 0,
      position: 8
    }),
    guilds: (id: string) => ({
      id,
      name: generateUsername(),
      afk_channel_id: generateSnowflake(),
      application_id: null,
      banner: null,
      channels: [],
      description: null,
      emojis: [],
      features: [],
      icon: null,
      is_partial: false,
      lazy: false,
      max_members: 250000,
      max_presences: 5000,
      max_video_channel_users: 25,
      member_count: Math.random() * 10000 | 0,
      mfa_level: 0,
      owner_id: generateSnowflake(),
      premium_tier: 0,
      presences: []
    })
  };

  // @ts-ignore
  generatorFunctions.owners = generatorFunctions.users;

  const client = {};
  const fakeClient = $0;

  for (const [k, count] of fakeClient.collections) {
    const collection = new Collection();
    for (let i = 0; i < count; ++i) {
      const id = generateSnowflake();
      // @ts-ignore
      collection.set(id, (generatorFunctions[k] || (() => ({})))(id));
    }

    // @ts-ignore
    client[k] = collection;
  }

  // @ts-ignore
  this.client = Object.freeze({
    ...client,
    login: (() => call(10)).bind(null),
    logout: (() => '\0').bind(null),
    destroy: (() => '\0').bind(null),
    exit: (() => '\0').bind(null),
    token: 'NTcxNjYxMjIxODU0NzA3NzEz.Dvl8Dw.aKlcU6mA69pSOI_YBB8RG7nNGUE'
  });
  // @ts-ignore
  global = Object.freeze(global);
}).call(global);

// POLYFILLS
// These are implemented because of problems with v8
//

Object.defineProperty(Array.prototype, 'fill', {
  value: function (value: any) {
    if (this.length > 100_000) throw new RangeError('Array buffer allocation failed');

    // Steps 1-2.
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var O = Object(this);

    // Steps 3-5.
    var len = O.length >>> 0;

    // Steps 6-7.
    var start = arguments[1];
    var relativeStart = start >> 0;

    // Step 8.
    var k = relativeStart < 0
      ? Math.max(len + relativeStart, 0)
      : Math.min(relativeStart, len);

    // Steps 9-10.
    var end = arguments[2];
    var relativeEnd = end === undefined
      ? len : end >> 0;

    // Step 11.
    var final = relativeEnd < 0
      ? Math.max(len + relativeEnd, 0)
      : Math.min(relativeEnd, len);

    // Step 12.
    while (k < final) {
      O[k] = value;
      k++;
    }

    // Step 13.
    return O;
  }
});

String.prototype.repeat = function (n) {
  if (this.length * n > 10_000 || n < 0) throw new RangeError('Invalid string length');
  let str = '';
  for (let i = 0; i < n; ++i) str += this;
  return str;
};
