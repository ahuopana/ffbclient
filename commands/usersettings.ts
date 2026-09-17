import * as Core from "../core";
import { Command } from ".";
import * as ClientCommands from "../model/clientcommands";

export class CommandUserSettings extends Command {
    public constructor(controller: Core.Controller) {
        super(controller);
    }

    public processCommand(data: FFB.Protocol.Messages.ServerUserSettings) {
        console.log("Received user settings", data.userSettingNames);

        this.controller.enqueueCommand(new ClientCommands.SetUserSettings(data));
    }
}
