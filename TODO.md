# TODO — browser client migration

Remaining work, in priority order. Background/architecture: see `CLAUDE.md`. The counterpart Docker/DB
work lives in the sibling `../ffb` repo (its own remaining tasks aren't duplicated here).

## P0 — land what's already done

- [x] Toolchain modernization (TS 2.9→5.7, webpack 4→5, Jest 24→29, Phaser 3.11→3.87), `Dockerfile.dev`,
      `.nvmrc`, configurable `FFB_SERVER_*` host/port, `index.html` merge-conflict-marker fix,
      `Promise<any>`→`Promise<void>` type fixes, and initial `join`/`status`/`version`/
      `passwordchallenge` command handlers — committed to branch `dev-ui`.
- [ ] Generate and commit `package-lock.json` (currently only exists inside the Docker image layer /
      named volume, not in this checkout — builds aren't reproducible without it).
- [ ] Open a PR from `dev-ui` once P1 below is verified (or earlier, for visibility).

## P1 — verify the basic connect/spectate flow works end to end

The join handshake (`serverJoin`/`serverStatus`/`serverVersion`/`serverPasswordChallenge`) was the
first confirmed blocker and now has minimal handlers (they `console.log`, no UI state changes yet).
The 5 previously-existing handlers (`serverGameState`, `serverModelSync`, `serverGameTime`,
`serverTalk`, `serverSound`) already cover the core "watch a game in progress" data path — so a full
manual test of spectating a live game against the containerized server is the next high-value thing to
try, not more handler-writing yet.

- [ ] Get an actual game running on the containerized `ffb-server` to spectate against (the DB seeds
      test coaches `Kalimar`/`BattleLore`/`LordCrunchy`/`LordMisery` via `DbInitializer`; check
      `../ffb/ffb-server/teams/*.xml` for loadable teams, or start a game via the legacy AWT client
      pointed at `localhost:22227`).
- [ ] Drive this client's connect scene through a real join (bypass the `fumbblapi.js`/fumbbl.com OAuth
      lobby for local testing — e.g. set `#wrapper`'s `user`/`auth`/`game` attributes manually, or add a
      dev-only shortcut) and confirm in the browser console that `Joined as...` / `Server status:` /
      `Server version:` log, and that the game state actually renders.
- [ ] Once confirmed, turn the new handlers from `console.log` stubs into real state updates (e.g.
      `serverStatus`/`serverVersion` should probably surface to the UI, not just the console).

## P2 — protocol/command parity (the bulk of the remaining work)

- [ ] Add handlers (in `commandhandler.ts` + `commands/*.ts`) and `ffb/protocol.d.ts` types for the
      remaining ~50 unhandled `SERVER_*` commands (`serverTeamList`, `serverGameList`,
      `serverUserSettings`, `serverAddPlayer`/`ZapPlayer`/`UnzapPlayer`/`RemovePlayer`, the sketch
      commands, replay commands, `serverAdminMessage`, `serverPong`, `serverAutomaticPlayerMarkings`,
      `serverUpdateLocalPlayerMarkers`). Cross-reference each against its
      `../ffb/ffb-common/.../net/commands/ServerCommand*.java` class for the payload shape.
- [ ] Implement outbound `CLIENT_*` commands beyond `clientJoin`/`clientTalk`/`clientRequestVersion`/
      `clientCloseSession` (currently all in `core/network.ts`) — starting with whatever
      `../ffb/ffb-client-logic`'s `ClientState` classes need for basic input (`clientSetupPlayer`,
      `clientMove`, `clientEndTurn`, `clientKickoff`, ...).

## P3 — feature build-out

- [ ] Work phase-by-phase through `../ffb/ffb-client-logic`'s `state/` package (one `ClientState` per
      game phase) as the backlog, cross-referenced against `scenes/layers/*` and `scenes/components/*`,
      which already scaffold most of the Phaser-side rendering.

## P4 — infra/tooling hardening

- [ ] CI: GitHub Actions here (build + `npm test`) and in `ahuopana/ffb` (`mvn test`), using the same
      Dockerfiles as local dev.
- [ ] Branch/PR workflow: decide whether `dev-ui` merges back to `master` here directly, or whether to
      also propose changes upstream to `christerk/ffbclient`.
- [ ] Revisit webpack vs. Vite (kept webpack, just upgraded to v5, for now — Vite would align tooling
      with the sibling `FUMBBLUI` repo).
- [ ] Confirm whether the `ws`/`@types/ws` devDependencies are actually needed anywhere (currently
      unused — `core/network.ts` uses the browser's global `WebSocket`, not the `ws` package).

## P5 — nice to have

- [ ] Bundle size: the production build is ~1.2 MiB (mostly Phaser) and webpack warns about it. Not
      urgent for local dev; worth revisiting with code-splitting before any real deployment.
