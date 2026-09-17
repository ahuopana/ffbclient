import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandReplayControl extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerReplayControl) {
        console.log("Replay control:", data.coach);

        this.controller.enqueueCommand(new ClientCommands.SetReplayController(data));
    }
}
