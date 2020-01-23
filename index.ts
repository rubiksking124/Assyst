import Assyst from './lib/Assyst';
import Config from './lib/Config';

const client: Assyst = new Assyst({
    config: new Config()
});

client.bot.on("gatewayReady", () => {
    
});

(async () => {
    await client.bot.run();
})();