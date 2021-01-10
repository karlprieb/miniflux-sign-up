FROM hayd/alpine-deno:1.6.2

USER deno

WORKDIR /app

COPY src/deps.ts .

RUN deno cache src/deps.ts

ADD . .

RUN deno cache src/main.ts

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-env", "src/main.ts"]