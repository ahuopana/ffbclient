import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandJoin extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerJoin) {
        console.log("Joined as", data.coach, "mode", data.clientMode);

        this.controller.enqueueCommand(new ClientCommands.SetJoinInfo(data));
    }
}
