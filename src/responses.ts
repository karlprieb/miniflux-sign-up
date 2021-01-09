import { errorHtml, formHtml } from "./form.ts";
import { HTTP } from "./deps.ts";

const render = (req: HTTP.ServerRequest, page: string): void => {
  const headers = new Headers();
  headers.set("content-type", "text/html; charset=utf-8");
  req.respond({ headers, body: page });
};

export const renderForm = (
  req: HTTP.ServerRequest,
  errorMessage?: string,
): void => render(req, formHtml(errorMessage ?? undefined));

export const renderError = (
  req: HTTP.ServerRequest,
  errorMessage: string,
): void => render(req, errorHtml(errorMessage));

export const renderInvalidRouteError = (req: HTTP.ServerRequest): void =>
  renderError(req, "Invalid Route");

export const redirectTo = (req: HTTP.ServerRequest, host: string): void => {
  const headers = new Headers();
  headers.set("Location", host);
  req.respond({ headers, status: HTTP.Status.Found });
};
