// This file is for isolated-vm

declare var $0: any;

// @ts-ignore
global.require = function(mod) {
    switch (mod) {
        default:
            throw new Error("Cannot find module " + mod);
    }
}.bind(null);

// @ts-ignore
global.process = {
    uptime() {
        return Date.now();
    }
}

// This unexposed function is called in "REST" functions
// to make it look like it makes an actual API call
function call(k: number) {
    throw new Error("401: Unauthorized");
}

class Collection extends Map {
    constructor(...args: any[]) {
        // @ts-ignore
        super(...args);
    }

    first() {
        return this.values().next().value;
    }

    random() {
        return [...this.values()][Math.random() * this.size | 0];
    }
}

class Channel {
    constructor(data: any) {
        for (const [k, v] of Object.entries(data)) {
            // @ts-ignore
            this[k] = v;
        }
    }

    send() {
        return call(1);
    }

    delete() {
        return call(2);
    }
}

(function () {
    const vowels = ["a", "e", "i", "o", "u"];
    const generateSnowflake = () => new Array(19).fill(null).map(() => Math.random() * 9 | 0).join("");
    const generateDiscriminator = () => (Math.random() * 9999 | 0).toString().padStart(4, "0");
    const generateUsername = () => new Array((Math.random() * 5 | 0) + 5)
        .fill(null)
        .map((_, i) => i % 2 === 0 ?
        vowels[Math.random() * vowels.length | 0] :
        (Math.random() > .8 ?
            (Math.random() * 9 | 0) :
            String.fromCharCode((Math.random() * 25 | 0) + 97))).join("");

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
            topic: "",
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
        token: "NTcxNjYxMjIxODU0NzA3NzEz.Dvl8Dw.aKlcU6mA69pSOI_YBB8RG7nNGUE"
    });
    global = Object.freeze(global);
}).call(global);



// POLYFILLS
// These are implemented because of problems with v8
// 

Object.defineProperty(Array.prototype, 'fill', {
    value: function(value: any) {
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
      var k = relativeStart < 0 ?
        Math.max(len + relativeStart, 0) :
        Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ?
        len : end >> 0;

      // Step 11.
      var final = relativeEnd < 0 ?
        Math.max(len + relativeEnd, 0) :
        Math.min(relativeEnd, len);

      // Step 12.
      while (k < final) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    }
  });

String.prototype.repeat = function(n) {
    if (this.length * n > 10_000 || n < 0) throw new RangeError('Invalid string length');
    let str = '';
    for (let i = 0; i < n; ++i) str += this;
    return str;
};
