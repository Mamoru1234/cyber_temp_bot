import {getClient, getMetricsCollection, getRedisClient} from './DbClient';
import {Metric} from './Metric';
import {BotChatMessageHandler, BotChatSession, BotWrapper} from './telegram/BotWrapper';
import { forEach } from 'lodash';
import {RedisContextProvider} from './telegram/ContextProvider';

function metricMessage(metric: Metric): string {
  return `
Стукачи настукали следующий расклад:
* Температура: ${metric.temp.toFixed(2)}
* Влажность: ${metric.humidity.toFixed(2)}
Время стука ${new Date(metric.timestamp).toLocaleString('en-US', { timeZone: 'Europe/Kiev' })}
`;
}

export function sendToAllSubscribers(bot: BotWrapper, message: string) {
  forEach(bot.getSessions(), async (session) => {
    console.log('Sending to session: ', session.getSessionId());
    const auth = await session.getValue('auth');
    if (auth) {
      console.log(`Auth passed: ${session.getSessionId()}`);
      session.sendMessageSync(message);
    }
  });
}

function showAuthBanner(session: BotChatSession, pass: string) {
  session.sendMessageSync('Чиркони парольчик плиз');
  session.registerUnknownHandler((message) => {
    if (message.text == pass) {
      session.sendMessageSync('Красава, можно теперь и /ask заюзать');
      session.setValue('auth', true);
      session.registerUnknownHandler(() => {
        session.sendMessageSync('Бро я ток команды умею');
      });
      return;
    }
    session.sendMessageSync('Не братан так дела не будет, походу ты не наш');
  });
}

export function getBot(token: string, pass: string) {
  const bot = new BotWrapper(token, getRedisClient());
  bot.setContextProvider(new RedisContextProvider(getRedisClient()));
  bot.onNewSession((session) => {
    session.registerHandler(new BotChatMessageHandler(/\/start/, async () => {
      const auth = await session.getValue('auth');
      if (!auth) {
        session.sendMessageSync('Вечер в хату');
        showAuthBanner(session, pass);
        return;
      }
      session.sendMessageSync('Даров братан, я не люблю шептать');
    }));
    session.registerHandler(new BotChatMessageHandler(/\/ask/, async () => {
      console.log(`Asking bot ${session.getSessionId()}`);
      const auth = await session.getValue('auth');
      console.log(`Auth: ${session.getSessionId()} ${auth}`);
      if (!auth) {
        session.sendMessageSync('Сначала деньги потом стулья. Сначала пароль потом красота.');
        showAuthBanner(session, pass);
        return;
      }
      const client = await getClient();
      console.log(`Client: ${session.getSessionId()}`);
      const metrics = await getMetricsCollection(client).find<Metric>()
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
      console.log(`Metrics: ${session.getSessionId()} ${JSON.stringify(metrics, null, 2)}`);
      if (metrics.length === 0) {
        session.sendMessageSync('Ниче сказать не могу, стукачи не настукали');
        return;
      }
      session.sendMessageSync(metricMessage(metrics[0]));
    }));
  });
  return bot;
}
