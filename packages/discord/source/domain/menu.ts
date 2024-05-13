import {ContextMenuCommandBuilder, ContextMenuCommandInteraction} from "discord.js";

import {DecoratorType, createDecorator} from "@buny/ioc";
import {usable} from "@buny/di";

abstract class ContextMenu {
  abstract builder(contextMenuBuilder: ContextMenuCommandBuilder): Promise<ContextMenuCommandBuilder> | ContextMenuCommandBuilder;

  abstract execute(commandInteraction: ContextMenuCommandInteraction): Promise<void> | void;
}

const contextMenuSet = new Map<string, typeof ContextMenu[]>();

const contextMenu = createDecorator("contextMenu", () => ({
  apply: [
    DecoratorType.Class,
  ],
  use: [
    usable(),
  ],
  instance: [
    ContextMenu,
  ],
}));

export {
  contextMenu,
};

export {
  ContextMenu,
};

export default contextMenuSet;
