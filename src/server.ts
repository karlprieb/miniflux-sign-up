import { log } from "./log.ts";
import { HTTP } from "./deps.ts";
import { BASE_URL, HOST, MINIFLUX_HOST } from "./env.ts";
import {
  redirectTo,
  renderError,
  renderForm,
  renderInvalidRouteError,
} from "./responses.ts";
import { createUser } from "./createUser.ts";

const readPostBody = async (rawBody: Deno.Reader): Promise<string> => {
  const raw = await Deno.readAll(rawBody);
  return new TextDecoder().decode(raw);
};

const handleForm = async (req: HTTP.ServerRequest): Promise<void> => {
  const body = await readPostBody(req.body);
  const createResponse = await createUser(body);

  if ("error_message" in createResponse) {
    return renderForm(req, createResponse.error_message);
  }

  return MINIFLUX_HOST
    ? redirectTo(req, MINIFLUX_HOST)
    : renderError(req, "Ooops, we're having some problems");
};

export const startServer = async (): Promise<void> => {
  const server = HTTP.serve({ hostname: HOST, port: 8000 });
  const serverUrl = BASE_URL ?? `http://${HOST}:8000`;

  log.info(`Server running on ${serverUrl}`);

  for await (const req of server) {
    switch (req.method) {
      case "GET":
        renderForm(req);
        break;
      case "POST":
        handleForm(req);
        break;
      default:
        renderInvalidRouteError(req);
        break;
    }
  }
};
