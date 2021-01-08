export const HOST: string = Deno.env.get("HOST") ?? "0.0.0.0";
export const PORT: number = Deno.env.get("PORT")
  ? Number(Deno.env.get("PORT"))
  : 8000;
export const BASE_URL: string = Deno.env.get("BASE_URL") ??
  `http://localhost:${PORT}`;
export const MINIFLUX_HOST: string | undefined = Deno.env.get("MINIFLUX_HOST");
export const AUTH_KEY: string | undefined = Deno.env.get("AUTH_KEY");
