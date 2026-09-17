import * as Core from "../core";
import { Command } from ".";

export class CommandVersion extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerVersion) {
        console.log("Server version:", data.serverVersion, "expects client version:", data.clientVersion);
    }
}
