import TelegramBot from 'node-telegram-bot-api';
import {getClient, getMetricsCollection} from './DbClient';
import {Metric} from './Metric';

function sendMessage(bot: TelegramBot, chatId: number, message: string) {
  bot.sendMessage(chatId, message)
    .catch((err) => {
      console.error('Bot send message error: ', err);
    });
}

function metricMessage(metric: Metric): string {
  return `
Стукачи настукали следующий расклад:
* Температура: ${metric.temp.toFixed(2)}
* Влажность: ${metric.humidity.toFixed(2)}
Время стука ${new Date(metric.timestamp).toLocaleString('en-US', { timeZone: 'Europe/Kiev' })}
`;
}

const subscriptions: Set<number> = new Set<number>();

export function sendToAllSubscribers(bot: TelegramBot, message: string) {
  subscriptions.forEach((chatId) => {
    sendMessage(bot, chatId, message);
  });
}

export function getBot(token: string, pass: string): TelegramBot {
  const telegramBot = new TelegramBot(token, {
    polling: true,
  });
  const registeredUsers: Set<number> = new Set<number>();
  telegramBot.onText(/\/start/, (message: TelegramBot.Message) => {
    telegramBot.sendMessage(message.chat.id, 'Чиркони парольчик плиз')
      .then((passMess: TelegramBot.Message) => {
        const listenerId = telegramBot.onReplyToMessage(passMess.chat.id, passMess.message_id, (reply: TelegramBot.Message) => {
          if (reply.text === pass) {
            registeredUsers.add(reply.from!!.id);
            telegramBot.removeReplyListener(listenerId);
            sendMessage(telegramBot, reply.chat.id, 'Красава, можно теперь и /ask заюзать');
            return;
          }
          sendMessage(telegramBot, reply.chat.id, 'Не братан так дела не будет, походу ты не наш');
        });
      })
      .catch((err) => {
        console.error('Bot send message error: ', err);
      });
  });
  telegramBot.onText(/\/subscribe/, (message: TelegramBot.Message) => {
    if (!registeredUsers.has(message.from!!.id)) {
      sendMessage(telegramBot, message.chat.id, 'Сначала деньги потом стулья. Сначала пароль потом красота.');
      return;
    }
    subscriptions.add(message.chat.id);
    sendMessage(telegramBot, message.chat.id, 'На тему подписался будешь знать');
  });
  telegramBot.onText(/\/ask/, async (message: TelegramBot.Message) => {
    if (!registeredUsers.has(message.from!!.id)) {
      sendMessage(telegramBot, message.chat.id, 'Сначала деньги потом стулья. Сначала пароль потом красота.');
      return;
    }

    const client = await getClient();
    const metrics = await getMetricsCollection(client).find<Metric>()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (metrics.length === 0) {
      sendMessage(telegramBot, message.chat.id, 'Ниче сказать не могу, стукачи не настукали');
      return;
    }

    sendMessage(telegramBot, message.chat.id, metricMessage(metrics[0]));
  });
  return telegramBot;
}
