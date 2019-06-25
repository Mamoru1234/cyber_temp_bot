import TelegramBot from 'node-telegram-bot-api';
import {getClient, getMetricsCollection} from './DbClient';
import {Metric} from './Metric';

const config = require('../config.json');

function sendMessage(bot: TelegramBot, chatId: number, message: string) {
  bot.sendMessage(chatId, message)
    .catch((err) => {
      console.error('Bot send message error: ', err);
    });
}

function metricMessage(metric: Metric): string {
  return `
Measure time: ${new Date(metric.timestamp).toTimeString()}
Temperature: ${metric.temp}
Humidity: ${metric.humidity}
`;
}

export function getBot(token: string, pass: string): TelegramBot {
  const telegramBot = new TelegramBot(token, {
    polling: true,
  });
  const registeredUsers: Set<number> = new Set<number>();
  telegramBot.onText(/\/start/, (message: TelegramBot.Message) => {
    telegramBot.sendMessage(message.chat.id, 'Enter passphrase please')
      .then((passMess: TelegramBot.Message) => {
        const listenerId = telegramBot.onReplyToMessage(passMess.chat.id, passMess.message_id, (reply: TelegramBot.Message) => {
          if (reply.text === pass) {
            registeredUsers.add(reply.from!!.id);
            telegramBot.removeReplyListener(listenerId);
            sendMessage(telegramBot, reply.chat.id, 'Correct pass you can /ask for whether now');
            return;
          }
          sendMessage(telegramBot, reply.chat.id, 'good try');
        });
      })
      .catch((err) => {
        console.error('Bot send message error: ', err);
      });
  });
  telegramBot.onText(/\/ask/, async (message: TelegramBot.Message) => {
    if (!registeredUsers.has(message.from!!.id)) {
      sendMessage(telegramBot, message.chat.id, 'Reply to passphrase first');
      return;
    }

    const client = await getClient();
    const [ metric ] = await getMetricsCollection(client).find<Metric>()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    sendMessage(telegramBot, message.chat.id, metricMessage(metric));
  });
  return telegramBot;
}

getBot(config.bot_token, config.bot_auth_token);

