import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandTeamList extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerTeamList) {
        console.log("Received team list", data.teamList);

        this.controller.enqueueCommand(new ClientCommands.SetTeamList(data));
    }
}
