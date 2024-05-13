import {Client, ClientOptions, RESTOptions, REST} from "discord.js";

import {shutdown, start} from "@buny/core";
import {usable, use} from "@buny/di";

import Config from "@buny/config";
import Logger from "@buny/logger";

import container, {useClass} from "@buny/ioc";

interface DiscordConfig {
  token: string;
  client: ClientOptions;
  rest?: Partial<RESTOptions>;
}

declare module "@buny/config" {
  interface ExtendableConfig {
    discord: DiscordConfig;
  }
}

await container.register(Client, useClass({
  constructor: Client,
  create: async () => {
    const config = await container.resolve(Config);

    if (!config.discord?.client?.intents) {
      throw new Error("Missing intents in discord client options");
    }

    const client = new Client(config.discord.client);

    client.rest.setToken(config.discord.token);

    return client;
  },
}));

await container.register(REST, useClass({
  constructor: REST,
  dependencies: [
    Config,
  ],
  create: async () => {
    const config = await container.resolve(Config);

    const rest = new REST(config.discord?.rest);

    rest.setToken(config.discord.token);

    return rest;
  },
}));

@usable()
class Discord {
  @use()
    client: Client;

  @use()
    logger: Logger;

  @start()
  async start() {
    await this.client.login().then(() => {
      this.logger.info(`Logged in as ${this.logger.mark(this.client.user.tag)}`);
    });
  }

  @shutdown()
  async shutdown() {
    await this.client.destroy().then(() => {
      this.logger.info("Logged out");
    });
  }
}

export * from "~/domain/event";
export * from "~/domain/command";
export * from "~/domain/slash";
export * from "~/domain/menu";

export default Discord;
