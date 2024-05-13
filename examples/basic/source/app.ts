import {GatewayIntentBits, Events, SlashCommandBuilder, CommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction} from "discord.js";

import App, {init} from "@buny/core";

import {usable, use} from "@buny/di";

import {event, SlashCommand, slashCommand, CommandRegistry, contextMenu, ContextMenu} from "@buny/discord";

import Logger from "@buny/logger";

@slashCommand()
class PingSlashCommand extends SlashCommand {
  builder(builder: SlashCommandBuilder) {
    return builder.setName("ping").setDescription("Replies with pong!");
  }

  execute = async (interaction: CommandInteraction) => {
    await interaction.reply("Pong!");
  };
}

@contextMenu()
class PingContextMenu extends ContextMenu {
  builder(builder: ContextMenuCommandBuilder) {
    return builder.setName("ping").setType(ApplicationCommandType.Message);
  }

  execute = async (interaction: MessageContextMenuCommandInteraction) => {
    await interaction.reply("Pong!");
  };
}

@usable()
class Bot extends App {
  @use()
    logger: Logger;

  @use()
    commandRegistry: CommandRegistry;

  @init()
  async init() {
    await this.commandRegistry.registerApplicationGuildCommands("1174954086009946112", "842974955972329494", [
      PingSlashCommand,
      PingContextMenu,
    ]);
  }

  @event(Events.ClientReady)
  async onReady() {
    this.logger.info("Bot is ready!");
  }
}

await Bot.bootstrap({
  discord: {
    token: process.env.DISCORD_TOKEN,
    client: {
      intents: [
        GatewayIntentBits.Guilds,
      ],
    },
  },
});
