/**
 * Tracks the state of the join/handshake conversation with the server
 * (serverJoin / serverStatus / serverVersion / serverPasswordChallenge),
 * so the connect scene (and any other UI) can surface it instead of it
 * only going to the console.
 */
export class ConnectionInfo {
    private joined: boolean;
    private coach: string;
    private clientMode: string;
    private playerNames: string[];
    private spectatorNames: string[];
    private spectators: number;
    private gameName: string;

    private serverStatus: string;
    private serverStatusMessage: string;

    private serverVersion: string;
    private clientVersion: string;
    private versionMismatch: boolean;

    private passwordChallengeIssued: boolean;

    public constructor() {
        this.joined = false;
        this.spectators = 0;
        this.playerNames = [];
        this.spectatorNames = [];
        this.versionMismatch = false;
        this.passwordChallengeIssued = false;
    }

    public setJoined(data: FFB.Protocol.Messages.ServerJoin) {
        this.joined = true;
        this.coach = data.coach;
        this.clientMode = data.clientMode;
        this.playerNames = data.playerNames || [];
        this.spectatorNames = data.spectatorNames || [];
        this.spectators = data.spectators;
        this.gameName = data.name;
    }

    public isJoined(): boolean {
        return this.joined;
    }

    public getCoach(): string {
        return this.coach;
    }

    public getClientMode(): string {
        return this.clientMode;
    }

    public getPlayerNames(): string[] {
        return this.playerNames;
    }

    public getSpectatorNames(): string[] {
        return this.spectatorNames;
    }

    public getSpectators(): number {
        return this.spectators;
    }

    public getGameName(): string {
        return this.gameName;
    }

    public setServerStatus(status: string, message: string) {
        this.serverStatus = status;
        this.serverStatusMessage = message;
    }

    public getServerStatus(): string {
        return this.serverStatus;
    }

    public getServerStatusMessage(): string {
        return this.serverStatusMessage;
    }

    /**
     * The reference client treats any non-OK status as blocking (e.g.
     * maintenance windows, disabled clients).
     */
    public isServerAvailable(): boolean {
        return this.serverStatus == null || this.serverStatus == "OK";
    }

    public setServerVersion(serverVersion: string, clientVersion: string) {
        this.serverVersion = serverVersion;
        this.clientVersion = clientVersion;
        this.versionMismatch = clientVersion != null && serverVersion != null && clientVersion != serverVersion;
    }

    public getServerVersion(): string {
        return this.serverVersion;
    }

    public getClientVersion(): string {
        return this.clientVersion;
    }

    public hasVersionMismatch(): boolean {
        return this.versionMismatch;
    }

    public setPasswordChallengeIssued(issued: boolean) {
        this.passwordChallengeIssued = issued;
    }

    public isPasswordChallengeIssued(): boolean {
        return this.passwordChallengeIssued;
    }
}
