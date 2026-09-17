import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandTeamSetupList extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerTeamSetupList) {
        console.log("Received team setup list", data.setupNames);

        this.controller.enqueueCommand(new ClientCommands.SetTeamSetupNames(data));
    }
}
