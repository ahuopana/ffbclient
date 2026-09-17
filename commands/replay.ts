import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandReplay extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerReplay) {
        console.log("Replaying", data.commandArray ? data.commandArray.length : 0, "commands");

        this.controller.enqueueCommand(new ClientCommands.ReplayCommands(data));
    }
}
