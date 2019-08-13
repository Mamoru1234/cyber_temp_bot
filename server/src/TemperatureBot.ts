import { getRedisClient } from './DbClient';
import { Metric } from './Metric';
import { BotChatMessageHandler, BotChatSession, BotWrapper } from './telegram/BotWrapper';
import { forEach } from 'lodash';
import { RedisContextProvider } from './telegram/ContextProvider';
import { AnomalyEvent, MetricAnalyzer } from './MetricAnalyzer';

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

export function getBot(token: string, pass: string, metricAnalyzer: MetricAnalyzer) {
  const bot = new BotWrapper(token, getRedisClient());
  metricAnalyzer.events.on(MetricAnalyzer.ANOMALY_EVENT, (event: AnomalyEvent) => {
    sendToAllSubscribers(bot, `Адище в офисе: ${event.temp.toFixed(2)}`);
  });
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
      const auth = await session.getValue('auth');
      if (!auth) {
        session.sendMessageSync('Сначала деньги потом стулья. Сначала пароль потом красота.');
        showAuthBanner(session, pass);
        return;
      }
      const metric = metricAnalyzer.getLastMetric();
      if (!metric) {
        session.sendMessageSync('Ниче сказать не могу, стукачи не настукали');
        return;
      }
      session.sendMessageSync(metricMessage(metric));
    }));
  });
  return bot;
}
