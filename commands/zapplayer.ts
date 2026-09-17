import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandZapPlayer extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerZapPlayer) {
        console.log("Zapping player", data.playerId, "on team", data.teamId);

        this.controller.enqueueCommand(new ClientCommands.SetPlayerZapped(data, true));
    }
}
