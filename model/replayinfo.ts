/**
 * Tracks replay playback status (serverReplayStatus) and who currently
 * controls replay navigation (serverReplayControl). The actual replayed
 * commands (serverReplay) are re-dispatched through the normal command
 * pipeline rather than stored here - see ClientCommands.ReplayCommands.
 */
export class ReplayInfo {
    private commandNr: number;
    private running: boolean;
    private forward: boolean;
    private speed: number;
    private skip: boolean;
    private controllingCoach: string;

    public constructor() {
        this.running = false;
        this.forward = true;
        this.speed = 1;
        this.skip = false;
    }

    public setStatus(data: FFB.Protocol.Messages.ServerReplayStatus) {
        this.commandNr = data.commandNr;
        this.running = data.running;
        this.forward = data.forward;
        this.speed = data.speed;
        this.skip = data.skip;
    }

    public getCommandNr(): number {
        return this.commandNr;
    }

    public isRunning(): boolean {
        return this.running;
    }

    public isForward(): boolean {
        return this.forward;
    }

    public getSpeed(): number {
        return this.speed;
    }

    public isSkip(): boolean {
        return this.skip;
    }

    public setControllingCoach(coach: string) {
        this.controllingCoach = coach;
    }

    public getControllingCoach(): string {
        return this.controllingCoach;
    }
}
