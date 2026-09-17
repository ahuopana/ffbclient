import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandAddSketches extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerAddSketches) {
        console.log("Adding sketches from", data.coach);

        this.controller.enqueueCommand(new ClientCommands.AddSketches(data));
    }
}
