# Sign Up page for Miniflux v2
Hey! This is a webserver that serves a signup form for Miniflux v2.
It's extremely simple. It receives the username and password from the form and makes a call to the Miniflux API to create a user. If the API returns some error this error is rendered, if not and the user was created successfully it will redirect you to Miniflux :)

It's developed with Typescript and Deno... Yep, I wanted to try Deno :) Welcome to the hype train!

## How to run
You need Deno >= 1.6 and `make` if you want to use the `makefile`

To run the webserver:
```
MINIFLUX_HOST=<your-miniflux-server-url> AUTH_KEY=<your-api-key> make run
```
You should have now a webserver running on `http://localhost:8000`.
You can pass `HOST` and `PORT` environment variables to set it.

## Development
For development you can run:
* `MINIFLUX_HOST=<your-miniflux-server-url> AUTH_KEY=<your-api-key> make dev` to keep the server reloading when you change files
* `make test` to run unit tests
* `make coverage` to generate unit test coverage
* `make lint` to run the linter
* `make format` to format files

## TODO
* Add tests to API calls and server responses
* Docker!
* Better logs
* Better documentation