import LZString from "lz-string";
import { Coordinate } from "../types";
import { createChallengeResponse } from "./passwordchallenge";

/**
 * Applies a server entered in the login form ("host", "host:port", or a full
 * "ws://host:port"/"wss://host:port") over the build-time default, so one
 * static build (e.g. a GitHub Pages preview) can point at any ffb-server
 * without rebuilding.
 */
export function applyServerOverride(server: string, target: { host: string, port: number, proto: string }) {
    if (!server) {
        return target;
    }

    let value = server.trim();
    let schemeMatch = value.match(/^(wss?:)\/\/(.+)$/);
    let proto = target.proto;
    if (schemeMatch) {
        proto = schemeMatch[1];
        value = schemeMatch[2];
    }

    let [serverHost, serverPort] = value.split(':');

    return {
        host: serverHost || target.host,
        port: serverPort ? parseInt(serverPort, 10) : target.port,
        proto: proto,
    };
}

export class Network {
    private ws: WebSocket;
    private config: any;

    public constructor() {
        console.log("Initializing Network");

    }

    public connect(commandHandler: any, config: any, onConnectionError?: (message: string) => void) {
        this.config = config;

        // FFB_SERVER_* are injected at build time (see webpack.config.js) so a dev/test
        // deployment can point at a local server instead of dev.fumbbl.com.
        let host = process.env.FFB_SERVER_HOST || window.location.host;
        if (!process.env.FFB_SERVER_HOST && (host.startsWith("localhost") || host.startsWith("192.168"))) {
            host = "dev.fumbbl.com";
        }
        let proto = process.env.FFB_SERVER_PROTO || (window.location.protocol == 'https:' ? 'wss:' : 'ws:');
        let port = process.env.FFB_SERVER_PORT ? parseInt(process.env.FFB_SERVER_PORT, 10) : (proto == 'wss:' ? 22224 : 22223);

        ({ host, port, proto } = applyServerOverride(config.server, { host, port, proto }));

        let target = proto+"//"+host+":"+port;
        console.log("Connecting to "+target);

        let ws: WebSocket = new WebSocket(target+"/command");
        let opened = false;

        ws.onopen = (evt) => {
            console.log('Open');
            opened = true;
            this.join();
        };

        ws.onmessage = (evt) => {
            let compressed = evt.data;
            let msg = LZString.decompressFromUTF16(compressed);
            commandHandler.handleCommand(JSON.parse(msg));
        };

        ws.onerror = (evt) => {
            console.log('Error', evt);
        };

        // A close before the connection ever opened means the target
        // host/port is unreachable or refusing connections - without this,
        // the connect scene is stuck on "Connecting..." forever since no
        // serverStatus/serverVersion ever arrives to say otherwise.
        ws.onclose = (evt) => {
            console.log('Close');
            if (!opened && onConnectionError) {
                onConnectionError("Could not connect to " + target + " - check the server address");
            }
        };

        this.ws = ws;
    }

    public join() {
        this.send({ netCommandId: "clientRequestVersion" });

        if (this.config.auth) {
            // Pre-authenticated (e.g. a FUMBBL OAuth token obtained by the lobby)
            // joins skip the password challenge, matching LoginLogicModule's
            // sendChallenge(): an already-available authentication token is sent
            // straight to clientJoin instead of being put through PasswordChallenge.
            this.sendJoin(this.config.auth);
        } else {
            this.send({ netCommandId: 'clientPasswordChallenge', coach: this.config.user });
        }
    }

    /**
     * Handles serverPasswordChallenge: computes the response per
     * com.fumbbl.ffb.PasswordChallenge and joins with it as clientJoin's password,
     * exactly as LoginLogicModule.handlePasswordChallenge does.
     */
    public sendPasswordChallengeResponse(challenge: string) {
        this.sendJoin(createChallengeResponse(this.config.password || '', challenge));
    }

    private sendJoin(password: string) {
        let joinMessage = {
            netCommandId: 'clientJoin',
            clientMode: this.config.mode || 'spectator',
            coach: this.config.user,
            password: password,
            gameId: parseInt(this.config.gameId),
            gameName: '',
            teamId: '',
            teamName: '',
        };

        this.send(joinMessage);
    }

    public sendChat(text: string) {
        let chatMessage = {
            netCommandId: 'clientTalk',
            talk: text,
        }

        this.send(chatMessage);
    }

    public leave() {
        let requestVersionMessage = {
            netCommandId: "clientCloseSession"
        };
        this.send(requestVersionMessage);
    }

    public sendSetupPlayer(playerId: string, coordinate: Coordinate) {
        let message = {
            netCommandId: 'clientSetupPlayer',
            playerId: playerId,
            coordinate: coordinate.toArray(),
        };

        this.send(message);
    }

    public sendStartGame() {
        let message = {
            netCommandId: 'clientStartGame',
        };

        this.send(message);
    }

    public sendCoinChoice(choiceHeads: boolean) {
        let message = {
            netCommandId: 'clientCoinChoice',
            choiceHeads: choiceHeads,
        };

        this.send(message);
    }

    public sendReceiveChoice(choiceReceive: boolean) {
        let message = {
            netCommandId: 'clientReceiveChoice',
            choiceReceive: choiceReceive,
        };

        this.send(message);
    }

    public sendKickoff(coordinate: Coordinate) {
        let message = {
            netCommandId: 'clientKickoff',
            ballCoordinate: coordinate.toArray(),
        };

        this.send(message);
    }

    private send(data: any) {
        let msg = JSON.stringify(data);
        let compressed = LZString.compressToUTF16(msg);
        console.log('Sending', msg);
        this.ws.send(compressed);
    }
}
