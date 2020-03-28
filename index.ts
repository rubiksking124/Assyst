import Assyst from './src/structures/Assyst';

import { webhooks } from './config.json';

const client = new Assyst();

client.commandClient.client.on('gatewayReady', () => {
  client.logger.info('Assyst is ready');
});

process.on('unhandledRejection', (err: any) => {
  client.commandClient.client.rest.executeWebhook(webhooks.unhandledRejection.id, webhooks.unhandledRejection.token, {
    embed: {
      title: 'Unhandled Rejection',
      color: 0xFF0000,
      description: err.message,
      fields: [
        {
          name: 'Stack',
          value: `\`\`\`js\n${err.stack}\`\`\``,
          inline: false
        }
      ]
    }
  });
});

(async () => {
  await client.commandClient.client.run();
})();
