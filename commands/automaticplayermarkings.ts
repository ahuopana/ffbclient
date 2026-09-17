import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandAutomaticPlayerMarkings extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerAutomaticPlayerMarkings) {
        console.log("Received automatic player markings", data.selectedIndex);

        this.controller.enqueueCommand(new ClientCommands.SetAutomaticPlayerMarkings(data));
    }
}
