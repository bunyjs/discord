import {SlashCommandBuilder, CommandInteraction} from "discord.js";

import {DecoratorType, createDecorator} from "@buny/ioc";
import {usable} from "@buny/di";

abstract class SlashCommand {
  abstract builder(slashCommandBuilder: SlashCommandBuilder): Promise<SlashCommandBuilder> | SlashCommandBuilder;

  abstract execute(commandInteraction: CommandInteraction): Promise<void> | void;
}

const slashCommandsSet = new Map<string, typeof SlashCommand[]>();

const slashCommand = createDecorator("slashCommand", () => ({
  apply: [
    DecoratorType.Class,
  ],
  use: [
    usable(),
  ],
  instance: [
    SlashCommand,
  ],
}));

export {
  slashCommand,
};

export {
  SlashCommand,
};

export default slashCommandsSet;
