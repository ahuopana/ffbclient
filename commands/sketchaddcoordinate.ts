import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandSketchAddCoordinate extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerSketchAddCoordinate) {
        console.log("Adding coordinate to sketch", data.id);

        this.controller.enqueueCommand(new ClientCommands.SketchAddCoordinate(data));
    }
}
