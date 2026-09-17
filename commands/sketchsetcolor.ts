import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandSketchSetColor extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerSketchSetColor) {
        console.log("Setting sketch color", data.ids, data.rgb);

        this.controller.enqueueCommand(new ClientCommands.SetSketchColor(data));
    }
}
