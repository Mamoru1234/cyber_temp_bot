import TelegramBot from 'node-telegram-bot-api';
import {ContextProvider, MemoryContextProvider} from './ContextProvider';
import {RedisClient} from 'redis';

export class BotChatMessageHandler {
  constructor(
    private _regexp: RegExp,
    private _handler: (message: TelegramBot.Message) => void) {}

  public canProcess(message: TelegramBot.Message) {
    return this._regexp.test(message.text || '');
  }

  public invoke(message: TelegramBot.Message) {
    return this._handler(message);
  }
}

export class BotChatSession {
  private _messageHandlers: BotChatMessageHandler[] = [];
  private _unknownConsumer?: (message: TelegramBot.Message) => void;
  private _settingValue: boolean = false;

  constructor(
    private _contextProvider: ContextProvider,
    private _bot: TelegramBot,
    private _chatId: number,
  ) {}

  public sendMessage(message: string, options?: TelegramBot.SendMessageOptions) {
    return this._bot.sendMessage(this._chatId, message, options);
  }

  public sendMessageSync(message: string, options?: TelegramBot.SendMessageOptions) {
    this.sendMessage(message, options).catch((e: Error) => {
      console.error(e);
    });
  }

  public getSessionId() {
    return `session_${this._chatId}`;
  }

  public registerUnknownHandler(handler: (message: TelegramBot.Message) => void) {
    this._unknownConsumer = handler;
  }

  public registerHandler(messageHandler: BotChatMessageHandler) {
    this._messageHandlers.push(messageHandler);
  }

  public getValue(key: string): Promise<any | undefined> {
    return this._contextProvider.getContext(this.getSessionId())
      .then((context) => context && context[key]);
  }

  public setValue(key: string, value: any) {
    if (this._settingValue) {
      this.sendMessageSync('Error: Set value lock wrong usage contact admin');
      return;
    }
    this._settingValue = true;
    this._contextProvider.getContext(this.getSessionId())
      .then((context) => {
        if (!context) {
          return {};
        }
        return context;
      })
      .then((context) => {
        context[key] = value;
        return this._contextProvider.saveContext(this.getSessionId(), context);
      })
      .then(() => {
        this._settingValue = false;
      });
  }

  public handleMessage(message: TelegramBot.Message) {
    const targetHandler = this._messageHandlers.find((handler) => handler.canProcess(message));
    if (!targetHandler) {
      if (!this._unknownConsumer) {
        this.sendMessageSync('Error: Unknown message received');
      }
      this._unknownConsumer && this._unknownConsumer(message);
    }
    targetHandler && targetHandler.invoke(message);
  }
}

export type SessionHandler = (session: BotChatSession) => void;

export class BotWrapper {
  private readonly _bot: TelegramBot;
  private _sessionHandler?: SessionHandler;
  private _botChatSessions: {[sessionId: string]: BotChatSession} = {};
  private _contextProvider: ContextProvider = new MemoryContextProvider();

  constructor(token: string, redis: RedisClient) {
    this._bot = new TelegramBot(token, { polling: true });
    redis.smembers('chats', (err, reply) => {
      if (err) {
        console.error(err);
      } else {
        reply.forEach((chatId) => {
          this._createSession(Number(chatId));
        });
      }
      this._bot.on('message', (message: TelegramBot.Message) => {
        const chatId = message.chat.id;
        if (!this._botChatSessions[chatId]) {
          redis.sadd('chats', `${chatId}`);
          this._createSession(chatId);
        }
        const session = this._botChatSessions[chatId];
        session.handleMessage(message);
      });
    });
  }

  private _createSession(chatId: number) {
    const newSession = new BotChatSession(this._contextProvider, this._bot, chatId);
    this._sessionHandler && this._sessionHandler(newSession);
    this._botChatSessions[chatId] = newSession;
  }

  public getSessions() {
    return this._botChatSessions;
  }

  public setContextProvider(provider: ContextProvider) {
    this._contextProvider = provider;
  }

  public onNewSession(sessionHandler: SessionHandler) {
    this._sessionHandler = sessionHandler;
  }
}
