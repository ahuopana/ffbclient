import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandRemoveSketches extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerRemoveSketches) {
        console.log("Removing sketches", data.ids);

        this.controller.enqueueCommand(new ClientCommands.RemoveSketches(data));
    }
}
