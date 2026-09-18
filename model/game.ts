import * as Model from ".";
import { Coordinate } from "../types";

export class Game {
    private isInitialized: boolean;
    public teamHome: Model.Team;
    public teamAway: Model.Team;
    private activePlayer: Model.Player;

    private moveSquares: Coordinate[];
    private trackNumbers: Coordinate[];

    private ballCoordinate: Coordinate;

    private half: number;
    private sidePlaying: Model.Side;

    private playerLocations: {[key: string]: Model.Player};

    public connectionInfo: Model.ConnectionInfo;

    private sketches: {[id: string]: FFB.Protocol.Messages.SketchType};
    private preventSketching: boolean;

    private automaticPlayerMarkings: {index: number, markings: {[playerId: string]: string}};

    public replayInfo: Model.ReplayInfo;
    private adminMessages: string[];

    private turnMode: string;
    private lastTurnMode: string;
    private dialogParameter: any;
    private setupOffense: boolean;
    private waitingForOpponent: boolean;

    /**
     * Root internal model class.
     *
     * Maintains the internal state of the application.
     */
    public constructor() {
        this.moveSquares = [];
        this.trackNumbers = [];
        this.isInitialized = false;
        this.sidePlaying = Model.Side.Home;
        this.half = 0;
        this.playerLocations = {};
        this.connectionInfo = new Model.ConnectionInfo();
        this.sketches = {};
        this.preventSketching = false;
        this.automaticPlayerMarkings = null;
        this.replayInfo = new Model.ReplayInfo();
        this.adminMessages = [];
        this.setupOffense = false;
        this.waitingForOpponent = false;
    }

    public getReplayInfo(): Model.ReplayInfo {
        return this.replayInfo;
    }

    public getConnectionInfo(): Model.ConnectionInfo {
        return this.connectionInfo;
    }

    public initialize(data: FFB.Protocol.Messages.ServerGameState) {
        if (!this.isInitialized) {
            this.isInitialized = true;
            this.teamHome = new Model.Team(this, data.game.teamHome);
            this.teamAway = new Model.Team(this, data.game.teamAway);

            if (data.game.fieldModel.ballCoordinate != null) {
                this.ballCoordinate = Coordinate.FromArray(data.game.fieldModel.ballCoordinate);
            }

            if (data.game.actingPlayer) {
                this.setActivePlayer(data.game.actingPlayer.playerId);
            }

            this.applyFieldModel(data.game.fieldModel);
            this.applyGameResult(data.game.gameResult);
            this.applyTurnData(data.game);
            return true;
        }
        return false;
    }

    public updatePlayerLocation(player: Model.Player, oldCoordinate: Coordinate, newCoordinate: Coordinate) {
        if (oldCoordinate && oldCoordinate.isOnField()) {
            this.playerLocations[oldCoordinate.x + "," + oldCoordinate.y] = null;
        }

        if (newCoordinate && newCoordinate.isOnField()) {
            this.playerLocations[newCoordinate.x + "," + newCoordinate.y] = player;
        }
    }

    public setActivePlayer(id: string) {
        if (id == null) {
            this.activePlayer = null;
        } else {
            let player = this.getPlayer(id);
            this.activePlayer = player;
        }
    }

    public getActivePlayer(): Model.Player {
        return this.activePlayer;
    }

    public getAssets() {
        let assets = {
            graphics: [],
            sprites: []

        };
        let homeAssets = this.teamHome.getAssets();
        for (let sprite in homeAssets['sprites']) {
            assets['sprites'].push(homeAssets['sprites'][sprite]);
        }
        for (let image in homeAssets['graphics']) {
            assets['graphics'].push(homeAssets['graphics'][image]);
        }

        let awayAssets = this.teamAway.getAssets();
        for (let sprite in awayAssets['sprites']) {
            assets['sprites'].push(awayAssets['sprites'][sprite]);
        }
        for (let image in awayAssets['graphics']) {
            assets['graphics'].push(awayAssets['graphics'][image]);
        }

        return assets;
    }

    public getPlayers(): Model.Player[] {
        let result = [];
        let players = this.teamHome.getPlayers();
        for (let i in players) {
            result.push(players[i]);
        }
        players = this.teamAway.getPlayers();
        for (let i in players) {
            result.push(players[i]);
        }
        return result;
    }

    public getPlayerOnLocation(coordinate: Coordinate) {
        return this.playerLocations[coordinate.x + "," + coordinate.y];
    }

    public getPlayer(id: string): Model.Player {
        let player = this.teamHome.getPlayer(id);

        if (!player) {
            player = this.teamAway.getPlayer(id);
        }

        return player;
    }

    public getTeamById(teamId: string): Model.Team {
        if (this.teamHome.getId() == teamId) {
            return this.teamHome;
        }
        if (this.teamAway.getId() == teamId) {
            return this.teamAway;
        }
        return null;
    }

    public removePlayer(playerId: string) {
        if (this.teamHome.getPlayer(playerId)) {
            this.teamHome.removePlayer(playerId);
        } else if (this.teamAway.getPlayer(playerId)) {
            this.teamAway.removePlayer(playerId);
        }
    }

    public getSketches(): {[id: string]: FFB.Protocol.Messages.SketchType} {
        return this.sketches;
    }

    public addSketches(sketches: FFB.Protocol.Messages.SketchType[]) {
        for (let sketch of sketches) {
            this.sketches[sketch.id] = sketch;
        }
    }

    public removeSketches(ids: string[]) {
        for (let id of ids) {
            delete this.sketches[id];
        }
    }

    public clearSketches() {
        this.sketches = {};
    }

    public sketchAddCoordinate(id: string, coordinate: Coordinate) {
        let sketch = this.sketches[id];
        if (sketch) {
            sketch.fieldCoordinates.push({x: coordinate.x, y: coordinate.y});
        }
    }

    public setSketchColor(ids: string[], rgb: number) {
        for (let id of ids) {
            let sketch = this.sketches[id];
            if (sketch) {
                sketch.rgb = rgb;
            }
        }
    }

    public setSketchLabel(ids: string[], text: string) {
        for (let id of ids) {
            let sketch = this.sketches[id];
            if (sketch) {
                sketch.text = text;
            }
        }
    }

    public isSketchingPrevented(): boolean {
        return this.preventSketching;
    }

    public setPreventSketching(prevent: boolean) {
        this.preventSketching = prevent;
    }

    public updatePlayerMarkers(markers: FFB.Protocol.Messages.PlayerMarkerType[]) {
        for (let marker of markers) {
            let player = this.getPlayer(marker.playerId);
            if (player) {
                player.setMarkerText(marker.homeText, marker.awayText);
            }
        }
    }

    public setAutomaticPlayerMarkings(index: number, markings: {[playerId: string]: string}) {
        this.automaticPlayerMarkings = { index: index, markings: markings };
    }

    public getAutomaticPlayerMarkings(): {index: number, markings: {[playerId: string]: string}} {
        return this.automaticPlayerMarkings;
    }

    public addAdminMessages(messages: string[]) {
        this.adminMessages = this.adminMessages.concat(messages);
    }

    public getAdminMessages(): string[] {
        return this.adminMessages;
    }

    public setTurnMode(turnMode: string) {
        this.turnMode = turnMode;
    }

    public getTurnMode(): string {
        return this.turnMode;
    }

    public setLastTurnMode(turnMode: string) {
        this.lastTurnMode = turnMode;
    }

    public getLastTurnMode(): string {
        return this.lastTurnMode;
    }

    public setDialogParameter(dialogParameter: any) {
        this.dialogParameter = dialogParameter;
    }

    public getDialogParameter(): any {
        return this.dialogParameter;
    }

    public setSetupOffense(setupOffense: boolean) {
        this.setupOffense = setupOffense;
    }

    public isSetupOffense(): boolean {
        return this.setupOffense;
    }

    public setWaitingForOpponent(waitingForOpponent: boolean) {
        this.waitingForOpponent = waitingForOpponent;
    }

    public isWaitingForOpponent(): boolean {
        return this.waitingForOpponent;
    }

    /**
     * A one-line, human-readable status for the pregame phases (team setup,
     * coin toss, kickoff), for a spectator's benefit - null outside those
     * phases. ffbclient only ever joins as a spectator (see core/network.ts),
     * so this is informational text, not a prompt for the viewer to act on;
     * the reference client only shows those as an interactive prompt to the
     * specific coach whose turn it is.
     */
    public getPregameStatusText(): string {
        let dialogId = (this.dialogParameter && this.dialogParameter.id) ? this.dialogParameter.id.name : null;

        if (dialogId == "COIN_TOSS_CHOICE") {
            return "Coin toss...";
        }

        if (dialogId == "RECEIVE_CHOICE") {
            let value = this.dialogParameter.value;
            let team = (value && value.teamId) ? this.getTeamById(value.teamId) : null;
            return (team ? team.getName() : "A team") + " is choosing to kick or receive...";
        }

        switch (this.turnMode) {
            case "setup":
                return this.getSetupStatusText();
            case "startGame":
                return "Starting game...";
            case "kickoff":
                return "Kicking off...";
            default:
                return null;
        }
    }

    /**
     * The team named here is whichever team the server currently has
     * mid-setup (sidePlaying, per applyTurnData/gameSetHomePlaying - both
     * teams set up in turn, defense first then offense - see setupOffense).
     */
    private getSetupStatusText(): string {
        let settingUpTeam = this.getTeamBySide(this.sidePlaying);
        if (!settingUpTeam) {
            return "Setting up teams...";
        }

        let role = this.setupOffense ? "offense" : "defense";
        let onField = settingUpTeam.getOnFieldCount();
        let total = settingUpTeam.getPlayerCount();
        return settingUpTeam.getName() + " is setting up (" + role + ") - " + onField + "/" + total + " on the field...";
    }

    public getPlayingSide(): Model.Side {
        return this.sidePlaying;
    }

    public setPlayingSide(side: Model.Side) {
        this.sidePlaying = side;
    }

    public getTeamBySide(side: Model.Side): Model.Team {
        return side == Model.Side.Home ? this.teamHome : this.teamAway;
    }

    public getHalf(): number {
        return this.half;
    }

    public setHalf(half: number) {
        this.half = half;
    }

    private applyFieldModel(data: FFB.Protocol.Messages.FieldModelType) {
        for (let pData of data.playerDataArray) {
            let player = this.getPlayer(pData.playerId);
            player.setState(pData.playerState);
            let [x,y] = pData.playerCoordinate;
            let coord = new Coordinate(x, y);
            player.setLocation(coord);
            if (coord.isOnField()) {
                this.playerLocations[x + "," + y] = player;
            }
        }
    }

    private applyTeamResult(team: Model.Team, data: FFB.Protocol.Messages.TeamResult) {
        team.setScore(data.score);
        this.applyPlayerResults(team, data.playerResults);
    }

    private applyPlayerResults(team: Model.Team, data: FFB.Protocol.Messages.PlayerResult[]) {
        for (let pr of data) {
            let player = team.getPlayer(pr.playerId);
            player.setSpp(pr.currentSpps);
            let gameSpp =
                pr.touchdowns * 3 +
                pr.casualties * 2 +
                pr.interceptions * 2 +
                pr.completions;
            player.setGameSpp(gameSpp);
        }
    }

    private applyTurnData(data: FFB.Protocol.Messages.GameType) {
        this.setHalf(data.half);
        this.setPlayingSide(data.homePlaying ? Model.Side.Home : Model.Side.Away);
        this.applyTeamTurnData(this.teamHome, data.turnDataHome);
        this.applyTeamTurnData(this.teamAway, data.turnDataAway);
        this.setTurnMode(data.turnMode ? data.turnMode.name : null);
        this.setLastTurnMode(data.lastTurnMode ? data.lastTurnMode.name : null);
        this.setDialogParameter(data.dialogParameter);
        this.setSetupOffense(data.setupOffense);
        this.setWaitingForOpponent(data.waitingForOpponent);
    }

    private applyTeamTurnData(team: Model.Team, data: FFB.Protocol.Messages.TurnData) {
        console.log("Applying Team Turn Data", data);
        team.setTurn(data.turnNr);
    }

    private applyGameResult(data: FFB.Protocol.Messages.GameResult) {
        this.applyTeamResult(this.teamHome, data.teamResultHome);
        this.applyTeamResult(this.teamAway, data.teamResultAway);
    }

    public hasMoveSquare(coordinate: Coordinate): boolean {
        for(let c of this.moveSquares) {
            if (c.x == coordinate.x && c.y == coordinate.y) {
                return true;
            }
        }
        return false;
    }

    public addMoveSquare(coordinate: Coordinate) {
        for (let c of this.moveSquares) {
            if (c.x == coordinate.x && c.y == coordinate.y) {
                return;
            }
        }

        this.moveSquares.push(coordinate);
    }

    public removeMoveSquare(coordinate: Coordinate) {
        let result: Coordinate[] = [];
        for (let c of this.moveSquares) {
            if (c.x != coordinate.x || c.y != coordinate.y) {
                result.push(c);
            }
        }
        this.moveSquares = result;
    }

    public getMoveSquares(): Coordinate[] {
        return this.moveSquares;
    }

    public hasTrackNumber(coordinate: Coordinate): boolean {
        for(let c of this.trackNumbers) {
            if (c.x == coordinate.x && c.y == coordinate.y) {
                return true;
            }
        }
        return false;
    }

    public addTrackNumber(coordinate: Coordinate) {
        for (let c of this.trackNumbers) {
            if (c.x == coordinate.x && c.y == coordinate.y) {
                return;
            }
        }

        this.trackNumbers.push(coordinate);
    }

    public removeTrackNumber(coordinate: Coordinate) {
        let result: Coordinate[] = [];
        for (let c of this.trackNumbers) {
            if (c.x != coordinate.x || c.y != coordinate.y) {
                result.push(c);
            }
        }
        this.trackNumbers = result;
    }

    public getTrackNumbers(): Coordinate[] {
        return this.trackNumbers;
    }

    public getBallCoordinate(): Coordinate {
        return this.ballCoordinate;
    }

    public setBallCoordinate(coordinate: Coordinate): void {
        this.ballCoordinate = coordinate;
    }

    /**
     * Find a space of width*height empty squares around a given player
     */
    public findEmptyPatchNearLocation(coordinate: Coordinate, width: number, height: number, additionalBlockedSquares?: Coordinate[]): Coordinate {
        let BIT_NE = 0x1;
        let BIT_NW = 0x2;
        let BIT_SE = 0x4;
        let BIT_SW = 0x8;
        let BIT_ANY = BIT_NE|BIT_NW|BIT_SE|BIT_SW;

        let squares: number[] = [];

        for (let y=0; y<15; y++) {
            for (let x=0; x<26; x++) {
                let bits = 0;

                if (x < width-1) {
                    bits = bits | BIT_NW | BIT_SW;
                }
                if (x >= 27-width) {
                    bits = bits | BIT_NE | BIT_SE;
                }
                if (y < height-1) {
                    bits = bits | BIT_NW | BIT_NE;
                }
                if (y >= 16-height) {
                    bits = bits | BIT_SW | BIT_SE;
                }

                squares[x + y*26] = bits;
            }
        }

        let blockedSquares = this.getPlayers().map((p) => {
            return p.getLocation();
        });

        if (additionalBlockedSquares != null) {
            blockedSquares = blockedSquares.concat(additionalBlockedSquares)
        }

        for (let coord of blockedSquares) {
            if (coord.isOnField()) {
                let pX = coord.x;
                let pY = coord.y;

                let startX = Math.max(pX - width + 1, 0);
                let startY = Math.max(pY - height + 1, 0);
                let endX = Math.min(pX + width - 1, 25);
                let endY = Math.min(pY + height - 1, 14);

                for (let cY = startY; cY <= endY; cY++) {
                    for (let cX = startX; cX <= endX; cX++) {
                        let cBits = 0;
                        if (cX <= pX) {
                            if (cY <= pY) {
                                cBits = cBits | BIT_SE;
                            }
                            if (cY >= pY) {
                                cBits = cBits | BIT_NE;
                            }
                        }
                        if (cX >= pX) {
                            if (cY <= pY) {
                                cBits = cBits | BIT_SW;
                            }
                            if (cY >= pY) {
                                cBits = cBits | BIT_NW;
                            }
                        }
                        squares[cY*26 + cX] = squares[cY*26 + cX] | cBits;
                    }
                }
            }
        }

        let start = coordinate;
        let startX = start.x;
        let startY = start.y;

        let square = null;
        let searchDistanceX = 1;
        let searchDistanceY = 1;

        do {
            let left = Math.max(startX - searchDistanceX, 0);
            let top = Math.max(startY - searchDistanceY, 0);

            let right = Math.min(startX + searchDistanceX, 25);
            let bottom = Math.min(startY + searchDistanceY, 14);

            // Check horizontally
            for (let cX=left; cX <= right; cX++) {
                if (squares[cX + top*26] != BIT_ANY) {
                    square = cX + top*26;
                    break;
                }
                if (squares[cX + bottom*26] != BIT_ANY) {
                    square = cX + bottom*26;
                    break;
                }
            }

            if (square == null) {
                // Check vertically
                for (let cY=top; cY <= bottom; cY++) {
                    if (squares[left + cY*26] != BIT_ANY) {
                        square = left + cY*26;
                        break;
                    }
                    if (squares[right + cY*26] != BIT_ANY) {
                        square = right + cY*26;
                        break;
                    }
                }
            }

            searchDistanceX++;
            searchDistanceY++;
        } while (square == null);

        let bits = squares[square];
        let x = square%26;
        let y = Math.floor(square/26);

        if ((bits & BIT_SE) == 0) {
            return new Coordinate(x, y);
        }
        if ((bits & BIT_SW) == 0) {
            return new Coordinate(x-(width-1), y);
        }
        if ((bits & BIT_NE) == 0) {
            return new Coordinate(x, y-(height-1));
        }
        if ((bits & BIT_NW) == 0) {
            return new Coordinate(x-(width-1), y-(height-1));
        }

        console.log("Oops, this shouldn't happpen.");

        return null;
    }

}