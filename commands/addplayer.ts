import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandAddPlayer extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerAddPlayer) {
        console.log("Adding player", data.player.playerId, "to team", data.teamId);

        this.controller.enqueueCommand(new ClientCommands.AddPlayer(data));
    }
}
