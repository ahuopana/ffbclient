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

    private teamList: FFB.Protocol.Messages.TeamListEntryType[];
    private gameList: FFB.Protocol.Messages.GameListEntryType[];
    private userSettings: {[key: string]: string};
    private teamSetupNames: string[];

    public constructor() {
        this.joined = false;
        this.spectators = 0;
        this.playerNames = [];
        this.spectatorNames = [];
        this.versionMismatch = false;
        this.passwordChallengeIssued = false;
        this.teamList = [];
        this.gameList = [];
        this.userSettings = {};
        this.teamSetupNames = [];
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

    /**
     * A coach or spectator left - updates the same spectator roster
     * setJoined populates, since that's what changed.
     */
    public setLeft(data: FFB.Protocol.Messages.ServerLeave) {
        this.spectatorNames = data.spectatorNames || [];
        this.spectators = data.spectators;
    }

    public setTeamList(teamList: FFB.Protocol.Messages.TeamListEntryType[]) {
        this.teamList = teamList || [];
    }

    public getTeamList(): FFB.Protocol.Messages.TeamListEntryType[] {
        return this.teamList;
    }

    public setGameList(gameList: FFB.Protocol.Messages.GameListEntryType[]) {
        this.gameList = gameList || [];
    }

    public getGameList(): FFB.Protocol.Messages.GameListEntryType[] {
        return this.gameList;
    }

    public setUserSettings(names: string[], values: string[]) {
        let userSettings: {[key: string]: string} = {};
        for (let i = 0; i < (names || []).length; i++) {
            userSettings[names[i]] = values[i];
        }
        this.userSettings = userSettings;
    }

    public getUserSettings(): {[key: string]: string} {
        return this.userSettings;
    }

    public setTeamSetupNames(setupNames: string[]) {
        this.teamSetupNames = setupNames || [];
    }

    public getTeamSetupNames(): string[] {
        return this.teamSetupNames;
    }
}
