import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandGameList extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerGameList) {
        console.log("Received game list", data.gameList);

        this.controller.enqueueCommand(new ClientCommands.SetGameList(data));
    }
}
