import { log } from "./log.ts";
import { HTTP } from "./deps.ts";
import { HOST, MINIFLUX_HOST, PORT } from "./env.ts";
import {
  redirectTo,
  renderError,
  renderForm,
  renderInvalidRouteError,
} from "./responses.ts";
import { createUser } from "./createUser.ts";

const readPostBody = async (rawBody: any): Promise<string> => {
  const raw = await Deno.readAll(rawBody);
  return new TextDecoder().decode(raw);
};

const handleForm = async (req: any): Promise<void> => {
  const body = await readPostBody(req.body);
  const createResponse = await createUser(body);

  const { error_message } = createResponse;

  if (error_message) {
    return renderForm(req, error_message);
  }

  return MINIFLUX_HOST
    ? redirectTo(req, MINIFLUX_HOST)
    : renderError(req, "Ooops, we're having some problems");
};

export const startServer = async (): Promise<void> => {
  const server = HTTP.serve({ hostname: HOST, port: PORT });

  log.info(`Server running on http://${HOST}:${PORT}`);

  for await (const req of server) {
    const { url, method } = req;
    if (url === "/" || url === "") {
      switch (method) {
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
    } else {
      renderInvalidRouteError(req);
    }
  }
};