import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandStatus extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerStatus) {
        console.log("Server status:", data.serverStatus, data.message);

        this.controller.enqueueCommand(new ClientCommands.SetServerStatus(data.serverStatus, data.message));
    }
}
