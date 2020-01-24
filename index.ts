import Assyst from './lib/Assyst';
import Config from './lib/Config';
import { readdirSync } from 'fs';

const client: Assyst = new Assyst({
    config: new Config()
});

client.bot.on("gatewayReady", () => {
    console.info("Assyst is ready");
});

(async () => {
    await client.bot.run();
})();