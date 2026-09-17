import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandVersion extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerVersion) {
        console.log("Server version:", data.serverVersion, "expects client version:", data.clientVersion);

        this.controller.enqueueCommand(new ClientCommands.SetServerVersion(data.serverVersion, data.clientVersion));
    }
}
