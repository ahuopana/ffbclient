import * as Core from "../core";
import { Command } from ".";

export class CommandStatus extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerStatus) {
        console.log("Server status:", data.serverStatus, data.message);
    }
}
