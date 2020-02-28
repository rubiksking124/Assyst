import Assyst from './lib/Assyst';
import Config from './lib/Config';

const client: Assyst = new Assyst({
    config: new Config()
});

client.bot.on('gatewayReady', () => {
    console.info('Assyst is ready');
});

process.on('unhandledRejection', (err: any) => {
    client.bot.channels.get(client.errorChannel)?.createMessage(`\`\`\`js\n${err.stack.toString()}\`\`\``);
});

(async () => {
    await client.bot.run();
})();