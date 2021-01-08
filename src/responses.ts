import { errorHtml, formHtml } from "./form.ts";
import { HTTP } from "./deps.ts";

const render = (req: any, page: string): void => {
  const headers = new Headers();
  headers.set("content-type", "text/html; charset=utf-8");
  req.respond({ headers, body: page });
};

export const renderForm = (req: any, errorMessage?: string): void =>
  render(req, formHtml(errorMessage ?? undefined));

export const renderError = (req: any, errorMessage: string): void =>
  render(req, errorHtml(errorMessage));

export const renderInvalidRouteError = (req: any): void =>
  renderError(req, "Invalid Route");

export const redirectTo = (req: any, host: string): void => {
  const headers = new Headers();
  headers.set("Location", host);
  req.respond({ headers, status: HTTP.Status.Found });
};
