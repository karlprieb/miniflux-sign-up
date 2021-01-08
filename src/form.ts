import { BASE_URL, MINIFLUX_HOST } from "./env.ts";

const page = (content: string): string =>
  `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - Miniflux</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Miniflux">
    <link rel="manifest" href="/manifest.json" crossorigin="use-credentials">

    <meta name="robots" content="noindex,nofollow">
    <meta name="referrer" content="no-referrer">
    <meta name="google" content="notranslate">

    
    <link rel="icon" type="image/png" sizes="16x16" href="${MINIFLUX_HOST}/icon/favicon-16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${MINIFLUX_HOST}/icon/favicon-32.png">

    
    <link rel="icon" type="image/png" sizes="128x128" href="${MINIFLUX_HOST}/icon/icon-128.png">
    <link rel="icon" type="image/png" sizes="192x192" href="${MINIFLUX_HOST}/icon/icon-192.png">

    
    <link rel="apple-touch-icon" sizes="120x120" href="${MINIFLUX_HOST}/icon/icon-120.png">
    <link rel="apple-touch-icon" sizes="152x152" href="${MINIFLUX_HOST}/icon/icon-152.png">
    <link rel="apple-touch-icon" sizes="167x167" href="${MINIFLUX_HOST}/icon/icon-167.png">
    <link rel="apple-touch-icon" sizes="180x180" href="${MINIFLUX_HOST}/icon/icon-180.png">

    <link rel="stylesheet" type="text/css" href="${MINIFLUX_HOST}/stylesheets/system_serif.css">
  </head>
  <body>
  ${content}
  </body>
  </html>
`;

const showError = (message: string): string => {
  return `
    <div class="alert alert-error">${message}</div>
  `;
};

export const formHtml = (errorMessage?: string): string => {
  const content = `
    <main>        
      <section class="login-form">
        <form action="${BASE_URL}" method="post">
          ${errorMessage ? showError(errorMessage) : ""}

          <label for="username">Username</label>
          <input type="text" name="username" id="username" value="" required autofocus>

          <label for="password">Password</label>
          <input type="password" name="password" id="password" value="" required>

          <div class="buttons">
              <button type="submit" class="button button-primary">Sign Up</button>
          </div>
        </form>
      </section>
    </main>
  `;

  return page(content);
};

export const errorHtml = (errorMessage: string): string =>
  page(showError(errorMessage));
