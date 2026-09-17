import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandLeave extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerLeave) {
        console.log("Left:", data.coach, "mode", data.clientMode);

        this.controller.enqueueCommand(new ClientCommands.SetLeft(data));
    }
}
