import Assyst from './lib/Assyst';
import Config from './lib/Config';
import { readdirSync } from 'fs';

const client: Assyst = new Assyst({
    config: new Config()
});

client.bot.on("gatewayReady", () => {
    console.info("Assyst is ready");
});

process.on('unhandledRejection', (err: any) => {
    client.bot.channels.get('560593330270896129')?.createMessage(`\`\`\`js\n${err.stack.toString()}\`\`\``)
});

(async () => {
    await client.bot.run();
})();