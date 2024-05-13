import {Events, Client} from "discord.js";

import container, {DecoratorType, TokenValue, createDecorator, invoke} from "@buny/ioc";

interface Event {
  module: TokenValue<unknown>;
  method: PropertyKey;
  once: boolean;
}

const eventStore = new Map<Events, Event[]>();

const event = createDecorator("Event", (event: Events, once = false) => ({
  apply: [
    DecoratorType.Method,
  ],
  onInit: (context) => {
    const events = eventStore.get(event) ?? [];

    events.push({
      module: context.class,
      method: context.propertyKey,
      once,
    });

    eventStore.set(event, events);
  },
}));

container.observe(Client, {
  resolved: (context) => {
    context.unsubscribe();

    const eventEntries = eventStore.entries();

    for (const [eventName, events] of eventEntries) {
      for (const event of events) {
        const handler = (...args: any[]) => {
          invoke({
            container,
            token: event.module,
            method: event.method,
            args: args,
          });
        };

        context.value[event.once ? "once" : "on"](eventName as any, handler);
      }
    }
  },
});

export {
  event,
};
