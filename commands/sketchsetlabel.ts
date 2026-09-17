import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandSketchSetLabel extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerSketchSetLabel) {
        console.log("Setting sketch label", data.ids, data.text);

        this.controller.enqueueCommand(new ClientCommands.SetSketchLabel(data));
    }
}
