import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandRemovePlayer extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerRemovePlayer) {
        console.log("Removing player", data.playerId);

        this.controller.enqueueCommand(new ClientCommands.RemovePlayer(data));
    }
}
