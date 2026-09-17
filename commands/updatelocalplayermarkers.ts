import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandUpdateLocalPlayerMarkers extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerUpdateLocalPlayerMarkers) {
        console.log("Updating player markers", data.playerMarkerArray);

        this.controller.enqueueCommand(new ClientCommands.UpdatePlayerMarkers(data));
    }
}
