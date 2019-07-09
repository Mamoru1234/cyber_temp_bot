import {RedisClient} from 'redis';

export interface ContextProvider {
  getContext(sessionId: string): Promise<{[key: string]: any} | undefined>;
  saveContext(sessionId: string, context: {[key: string]: any}): void;
}

export class MemoryContextProvider implements ContextProvider {
  private _contexts: {[sessionId: string]: any} = {};

  getContext(sessionId: string): Promise<{[key: string]: any} | undefined> {
    return Promise.resolve(this._contexts[sessionId]);
  }

  saveContext(sessionId: string, context: { [p: string]: any }): void {
    this._contexts[sessionId] = context;
  }
}


export class RedisContextProvider implements ContextProvider {
  constructor(
    private _client: RedisClient
  ) {}

  getContext(sessionId: string): Promise<{ [p: string]: any } | undefined> {
    return new Promise<{[p: string]: any}|undefined>((res, rej) => {
      this._client.get(sessionId, (err, reply) => {
        if (err) {
          rej(err);
          return;
        }
        res(JSON.parse(reply));
      });
    }).then((context) => context);
  }

  saveContext(sessionId: string, context: { [p: string]: any }): void {
    this._client.set(sessionId, JSON.stringify(context));
  }
}
