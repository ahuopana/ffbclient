import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandSetPreventSketching extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerSetPreventSketching) {
        console.log("Setting prevent sketching", data.prevent);

        this.controller.enqueueCommand(new ClientCommands.SetPreventSketching(data));
    }
}
