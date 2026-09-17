# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context: this repo in the wider workspace

`ffbclient` is one of three sibling repo checkouts inside a shared (non-git) workspace directory, along
with `../ffb` (Java server + legacy AWT client) and `../FUMBBLUI` (unrelated website/lobby UI). A
`docker-compose.yml` at the workspace root (one level up from here) orchestrates all of them for local
dev — it expects `../ffb` and `../ffbclient` to exist as siblings, so don't move this checkout without
updating that file too. `origin` here is `ahuopana/ffbclient` (fork); `upstream` is `christerk/ffbclient`.

## Commands

- **Bring up the full dev stack** (db + `ffb-server` + this client): `cd ..; podman-compose up -d` (or
  `docker compose up -d`) from the workspace root, not from this directory.
- **Logs**: `podman logs -f fumbbl_client_1` (this service), `fumbbl_server_1`, `fumbbl_db_1`.
- **Tests/build — run inside the container, not on the host** (no local Node toolchain is assumed):
  `podman exec fumbbl_client_1 npm test`, `podman exec fumbbl_client_1 npm run build`.
- Source is bind-mounted into the `client` container, so `webpack serve` hot-reloads on save — no
  rebuild needed for `.ts` changes. Rebuild only after `package.json`/`Dockerfile.dev` changes:
  `podman-compose up -d --build client` (run from the workspace root).
- Dev server: `http://localhost:8080`. Server websocket it talks to: `ws://localhost:22227/command`
  (see `core/network.ts` for how the target host/port is resolved).

## Architecture: replacing the Java client

- **Goal**: this becomes the replacement for `../ffb`'s Java Swing/AWT client, talking to the
  *unmodified* `ffb-server` over its existing websocket/JSON command protocol. The server is not being
  rewritten — this repo only needs to speak its existing wire format correctly.
- **Wire protocol**: `netCommandId` string constants are defined server-side in
  `../ffb/ffb-common/src/main/java/com/fumbbl/ffb/net/NetCommandId.java` (~55 `SERVER_*` + ~85
  `CLIENT_*` commands — that file is the ground truth for what exists). Server-side payload shapes live
  in `../ffb/ffb-common/.../net/commands/*.java`; how the *reference* client is supposed to react to
  them lives in `../ffb/ffb-client-logic/src/main/java/com/fumbbl/ffb/client/{net,handler,state}/` —
  the `state/` package (`ClientState` classes, one per game phase) is the authoritative spec for
  input/phase behavior this client needs to reproduce.
- **Protocol handling in this repo**: `core/network.ts` (websocket connection, LZString-compressed
  JSON framing), `core/commandhandler.ts` (dispatch table keyed by `netCommandId` — this is the
  registry to extend when adding a new server command), `commands/*.ts` (one class per handled server
  command, `Command` base class in `commands/command.ts`), `ffb/protocol.d.ts` (payload type
  declarations, namespaced `FFB.Protocol.Messages`). **This currently covers only a small subset of the
  full protocol** — see `TODO.md` for what's missing.
- **Configurable server target**: `core/network.ts` reads `process.env.FFB_SERVER_HOST`/`PORT`/`PROTO`
  (a webpack `DefinePlugin` substitution — see `webpack.config.js` — not real Node env vars; typed in
  `types/env.d.ts`), falling back to the original `dev.fumbbl.com` behavior when unset. This is what
  lets the container point at the sibling `ffb-server` container instead of the live site; set via the
  `client` service's `environment:` block in the workspace-root `docker-compose.yml`.
- **Rendering**: `scenes/` holds the Phaser 3 scenes (`connectscene.ts`, `bootscene.ts`,
  `mainscene.ts`), `scenes/layers/*` the field/player/ball/dugout rendering layers, and
  `scenes/components/*` reusable UI widgets (panels, menus, player cards). `model/` holds client-side
  game state (`Game`, `Player`, `Team`, `Position`, `CommandManager`).
- **Lobby integration**: `index.html` + `fumbblapi.js` implement a minimal match-list/OAuth flow against
  the real `fumbbl.com` API (needs `auth.json`, see `README.md`) — unrelated to the local dev server
  connection and not expected to work against the containerized stack.

## Known gotchas

- No `package-lock.json` is committed yet — `npm install` currently only runs inside the Docker image
  build, so it isn't reproducible from a bare checkout. See `TODO.md`.
- `webpack.config.js` is read once at `webpack serve` startup, not watched — changes there need a
  container restart (`podman restart fumbbl_client_1`), unlike `.ts` source changes.
- TS config uses `moduleResolution: "bundler"` (TS 5+) deliberately, to avoid the `node10` deprecation
  warning under modern TypeScript while still resolving extensionless imports the way webpack does.
- `jest.config.js` overrides `ts-jest`'s `module`/`moduleResolution` to `commonjs`/`node` even though
  `tsconfig.json` targets `esnext`/`bundler` for the webpack build — Jest runs CommonJS, webpack doesn't;
  don't "simplify" this into one shared config.
