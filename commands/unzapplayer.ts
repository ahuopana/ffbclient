import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandUnzapPlayer extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerUnzapPlayer) {
        console.log("Unzapping player", data.playerId, "on team", data.teamId);

        this.controller.enqueueCommand(new ClientCommands.SetPlayerZapped(data, false));
    }
}
