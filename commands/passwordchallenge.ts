import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandPasswordChallenge extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerPasswordChallenge) {
        console.log("Server password challenge received");

        this.controller.enqueueCommand(new ClientCommands.SetPasswordChallengeIssued());
    }
}
