import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandAdminMessage extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerAdminMessage) {
        console.log("Admin message", data.messageArray);

        this.controller.enqueueCommand(new ClientCommands.AddAdminMessages(data));
    }
}
