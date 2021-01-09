run:
	DENO_DIR=./deno_dir deno run --allow-net --allow-env src/main.ts
dev:
	DENO_DIR=./deno_dir deno run --unstable --watch --allow-net --allow-env src/main.ts
test:
	DENO_DIR=./deno_dir deno test --allow-env src
coverage:
	DENO_DIR=./deno_dir deno test --coverage --unstable --allow-env src
format:
	deno fmt src
lint:
	deno --unstable src