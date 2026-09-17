import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandClearSketches extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerClearSketches) {
        console.log("Clearing sketches");

        this.controller.enqueueCommand(new ClientCommands.ClearSketches());
    }
}
