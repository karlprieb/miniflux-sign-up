import { log } from "./log.ts";
import { AUTH_KEY, MINIFLUX_HOST } from "./env.ts";
import { startServer } from "./server.ts";

const init = async (): Promise<void> => {
  if (MINIFLUX_HOST && AUTH_KEY) {
    return await startServer();
  }

  log.error("MINIFLUX_HOST and/or AUTH_KEY not defined");
  return;
};

init();
