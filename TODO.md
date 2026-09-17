# TODO — browser client migration

Remaining work, in priority order. Background/architecture: see `CLAUDE.md`. The counterpart Docker/DB
work lives in the sibling `../ffb` repo (its own remaining tasks aren't duplicated here).

## P0 — land what's already done

- [x] Toolchain modernization (TS 2.9→5.7, webpack 4→5, Jest 24→29, Phaser 3.11→3.87), `Dockerfile.dev`,
      `.nvmrc`, configurable `FFB_SERVER_*` host/port, `index.html` merge-conflict-marker fix,
      `Promise<any>`→`Promise<void>` type fixes, and initial `join`/`status`/`version`/
      `passwordchallenge` command handlers — committed to branch `dev-ui`.
- [x] Generate and commit `package-lock.json` — done from a clean `npm install` (644 packages),
      verified reproducible with `npm ci`, and `npm test`/`tsc --noEmit`/`npm run build` all still pass
      against it. Removed it from `.gitignore`.
- [x] Fix the toolchain gaps the Phaser 3.11→3.87/3.90 bump left behind, found while actually running
      `npm test`/`tsc`/`npm run build` for the first time post-upgrade (previously untested — see P1):
      a stale vendored `phaser.d.ts` (from before Phaser shipped its own types) was silently masking
      real type errors project-wide via a now-broken `tsconfig.json` `paths` override; once removed,
      that surfaced several genuine Phaser 3.90 API breaks (`TweenManager.createTimeline` → the new
      `Timeline` game object API in `core/dicemanager.ts` + `scenes/layers/floattext.ts`,
      `TextStyle.fill` → `color`, `Sprite.setScaleMode` → `texture.setFilter`, `Game.resize` →
      `Scene.scale.resize`, an untyped/dotted `GameConfig`, and a `MainScene` field shadowing
      `Phaser.Scene.scale`). Also fixed `jest.config.js` resolving `phaser`'s raw, un-built `src/`
      entry point instead of the `dist/` bundle webpack uses (which pulled in a debug-only dependency
      that isn't installed), and added `jest-canvas-mock` since jsdom's `<canvas>` has no real 2D
      context. `npm test`/`tsc --noEmit`/`npm run build` all pass clean now.
- [ ] Open a PR from `dev-ui` once P1 below is verified (or earlier, for visibility).

## P1 — verify the basic connect/spectate flow works end to end

The join handshake (`serverJoin`/`serverStatus`/`serverVersion`/`serverPasswordChallenge`) was the
first confirmed blocker. The 5 previously-existing handlers (`serverGameState`, `serverModelSync`,
`serverGameTime`, `serverTalk`, `serverSound`) already cover the core "watch a game in progress" data
path — so a full manual test of spectating a live game against the containerized server is still the
next high-value thing to try.

- [x] Turn the 4 handshake handlers from `console.log`-only stubs into real state updates: a new
      `Model.ConnectionInfo` (on `Game`) tracks join info / server status / server-vs-client version /
      password-challenge state, each handler enqueues a `ClientCommands.Set*` that updates it and fires
      a new `EventType.ConnectionInfoChanged`, and `ConnectScene` listens for that event and replaces the
      static "Connecting..." text with the actual status (server unavailable + reason, version mismatch,
      authenticating, joined as `<coach>`). Unit tests in `tests/model/connectioninfo.test.ts`,
      `tests/model/clientcommands.test.ts`, `tests/commands/*.test.ts` — committed to `dev-ui`, and now
      verified actually passing under `npm test` (all 35 tests, 7 suites) now that the toolchain gaps
      above are fixed — they hadn't been runnable before. **Still needs manual verification against a
      real/containerized server**, the next item below.
- [ ] Get an actual game running on the containerized `ffb-server` to spectate against (the DB seeds
      test coaches `Kalimar`/`BattleLore`/`LordCrunchy`/`LordMisery` via `DbInitializer`; check
      `../ffb/ffb-server/teams/*.xml` for loadable teams, or start a game via the legacy AWT client
      pointed at `localhost:22227`).
- [ ] Drive this client's connect scene through a real join (bypass the `fumbblapi.js`/fumbbl.com OAuth
      lobby for local testing — e.g. set `#wrapper`'s `user`/`auth`/`game` attributes manually, or add a
      dev-only shortcut) and confirm the loading screen now shows the status/version/join text described
      above, and that the game state actually renders.

## P2 — protocol/command parity (the bulk of the remaining work)

- [x] The pregame/kickoff command set needed to get a fresh game started, as distinct from in-play
      gameplay commands (traced through `ffb-client-logic`'s `ClientState`/`LogicModule` classes to
      confirm scope — the setup→coin-toss→kickoff phase transitions themselves ride on the existing
      `serverGameState`/`serverModelSync` handlers via `Game.turnMode`, no separate command needed for
      those):
      - Outbound `CLIENT_*` (in `core/network.ts` + `core/controller.ts`): `clientSetupPlayer`,
        `clientStartGame`, `clientCoinChoice`, `clientReceiveChoice`, `clientKickoff`. Not yet wired to
        any UI (no setup drag-and-drop, coin-toss dialog, or kickoff-placement click handler exists in
        `scenes/*` yet) — that's P3 work, driven by the same `ClientState` classes.
      - Inbound `SERVER_*` (in `commands/*.ts` + `model/clientcommands.ts`): `serverAddPlayer`,
        `serverZapPlayer`, `serverUnzapPlayer`, `serverRemovePlayer`. `Model.Team` gained
        `addPlayer`/`removePlayer`/`getId`, `Model.Game` gained `getTeamById`/`removePlayer`.
        Simplification: the reference client swaps a roster player for a distinct `ZappedPlayer` type on
        zap (and back on unzap); `ffbclient` doesn't have team-roster-selection UI yet to consume that
        distinction, so `Model.Player` just gained a `zapped` boolean flag instead — revisit if/when a
        roster-selection screen is built.
      - Unit tests: `tests/model/team.test.ts`, `tests/model/game.test.ts` (new), `tests/types/coordinate.test.ts`
        (new, covers the new `Coordinate.toArray()` used for outbound field-coordinate payloads),
        `tests/commands/{addplayer,zapplayer,unzapplayer,removeplayer}.test.ts`, and additions to
        `tests/model/clientcommands.test.ts`. New shared fixtures in `tests/fixtures.ts`. All passing.
- [x] **`SERVER_*` handler coverage is now complete** — all 32 commands in `NetCommandId.java` have a
      client-side handler (`core/commandhandler.ts` registers all 32; verified by diffing against a
      fresh `grep -oE '\bSERVER_[A-Z_]+\b' NetCommandId.java`). Added in four batches (each committed
      separately on `dev-ui`), all with `ffb/protocol.d.ts` types cross-referenced against the matching
      `../ffb/ffb-common/.../net/commands/ServerCommand*.java` class and unit tests:
      - Lobby/login (`serverLeave`, `serverTeamList`, `serverGameList`, `serverUserSettings`,
        `serverTeamSetupList`): extend `Model.ConnectionInfo`, same theme as the existing join-handshake
        state (see `ClientStateLogin.handleCommand` in `ffb-client-logic`, which switches on all of
        these together).
      - Sketches — the coach telestrator/drawing tool (`serverAddSketches`, `serverRemoveSketches`,
        `serverSketchAddCoordinate`, `serverSketchSetColor`, `serverSketchSetLabel`,
        `serverClearSketches`, `serverSetPreventSketching`): new `Model.Game.sketches` state. Note the
        wire protocol has two different `FieldCoordinate` JSON shapes — the `[x, y]` array form used
        almost everywhere (`Coordinate`), and a `{x, y}` object form used only for a sketch's own path
        points (`FieldCoordinateXY`), because the server serializes those two cases through different
        Java methods.
      - Player markers (`serverUpdateLocalPlayerMarkers`, `serverAutomaticPlayerMarkings`):
        `Model.Player` gained `homeMarkerText`/`awayMarkerText`.
      - Replay/misc (`serverReplay`, `serverReplayStatus`, `serverReplayControl`, `serverPong`,
        `serverAdminMessage`): new `Model.ReplayInfo` (mirrors `ConnectionInfo`'s pattern) for playback
        status/control. `serverReplay` batches historical commands, each with its own `netCommandId` —
        rather than storing them, they're re-dispatched through the exact same `CommandHandler` pipeline
        a live command would go through (`Controller` now holds a `CommandHandler` reference for this).
      **None of this has rendering/UI yet** (sketches aren't drawn, markers aren't shown, replay has no
      playback controls) — same protocol-then-UI split as the pregame set above. That's P3 work.
- [ ] Implement the remaining in-play gameplay `CLIENT_*` commands beyond `clientJoin`/`clientTalk`/
      `clientRequestVersion`/`clientCloseSession`/the pregame set above — starting with whatever
      `../ffb/ffb-client-logic`'s `ClientState` classes need for basic input (`clientMove`,
      `clientEndTurn`, `clientBlock`, ...). This is genuinely the bulk of what's left: `SERVER_*` handler
      coverage being complete only means the client can now observe/track everything the server sends;
      actually *playing* a turn (not just spectating) still needs these.

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
- [x] Confirm whether the `ws`/`@types/ws` devDependencies are actually needed anywhere — confirmed
      unused (`core/network.ts` uses the browser's global `WebSocket`; the `ws` import there was already
      commented out) and removed, along with the dead commented-out import. They remain in
      `node_modules` only as transitive deps of `jest-environment-jsdom`/`webpack-dev-server`.
      `package-lock.json` regenerated; `npm test`/`tsc --noEmit`/`npm run build` still pass.

## P5 — nice to have

- [ ] Bundle size: the production build is ~1.2 MiB (mostly Phaser) and webpack warns about it. Not
      urgent for local dev; worth revisiting with code-splitting before any real deployment.
