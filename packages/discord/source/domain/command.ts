import {REST, Routes, ContextMenuCommandBuilder, SlashCommandBuilder, Client} from "discord.js";

import container from "@buny/ioc";

import {usable, use} from "@buny/di";

import slashCommandsSet, {SlashCommand} from "~/domain/slash";
import contextMenuSet, {ContextMenu} from "~/domain/menu";

type Command = typeof SlashCommand | typeof ContextMenu;

@usable()
class CommandRegistry {
  @use()
    rest: REST;

  private registerCommand = async (command: Command | Command[]) => {
    const commands = Array.isArray(command) ? command : [command];

    const body = [];

    for (const command of commands) {
      const module = await container.resolve<Command>(command as any);

      if (module instanceof SlashCommand) {
        const builder = await module.builder(new SlashCommandBuilder());

        body.push(builder.toJSON());

        const commands = slashCommandsSet.get(builder.name) ?? [];

        commands.push(command as typeof SlashCommand);

        slashCommandsSet.set(builder.name, commands);

        continue;
      }

      if (module instanceof ContextMenu) {
        const builder = await module.builder(new ContextMenuCommandBuilder());

        body.push(builder.toJSON());

        const commands = contextMenuSet.get(builder.name) ?? [];

        commands.push(command as typeof ContextMenu);

        contextMenuSet.set(builder.name, commands);

        continue;
      }

      throw new Error("Invalid command type.");
    }

    return body;
  };

  registerApplicationGuildCommands = async (applicationId: string, guildId: string, command: Command | Command[]) => {
    const body = await this.registerCommand(command);

    return this.rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
      body,
    });
  };

  registerApplicationCommands = async (applicationId: string, command: Command | Command[]) => {
    const body = await this.registerCommand(command);

    return this.rest.put(Routes.applicationCommands(applicationId), {
      body,
    });
  };
}

container.observe(Client, ({
  resolved: (context) => {
    context.unsubscribe();

    context.value.on("interactionCreate", async (interaction) => {
      if (interaction.isContextMenuCommand()) {
        const commands = contextMenuSet.get(interaction.commandName);

        if (!commands) {
          return;
        }

        for (const command of commands) {
          const module = await container.resolve(command);
          await module.execute(interaction);
        }

        return;
      }

      if (interaction.isCommand()) {
        const commands = slashCommandsSet.get(interaction.commandName);

        if (!commands) {
          return;
        }

        for (const command of commands) {
          const module = await container.resolve(command);
          await module.execute(interaction);
        }

        return;
      }
    });
  },
}));

export {
  CommandRegistry,
};
