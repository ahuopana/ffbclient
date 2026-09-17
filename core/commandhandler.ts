import * as Commands from "../commands";
import * as Core from ".";

export class CommandHandler {
    private commandHandlers: {[id:string]:Commands.Command};
    private network: Core.Network;
    private controller: Core.Controller;

    public constructor(network: Core.Network, controller: Core.Controller) {
        this.commandHandlers = {
            "serverGameState": new Commands.CommandGameState(controller),
            "serverModelSync": new Commands.CommandModelSync(controller),
            "serverGameTime": new Commands.CommandGameTime(controller),
            "serverTalk": new Commands.CommandServerTalk(controller),
            "serverSound": new Commands.CommandServerSound(controller),
            "serverJoin": new Commands.CommandJoin(controller),
            "serverStatus": new Commands.CommandStatus(controller),
            "serverVersion": new Commands.CommandVersion(controller),
            "serverPasswordChallenge": new Commands.CommandPasswordChallenge(controller),
            "serverAddPlayer": new Commands.CommandAddPlayer(controller),
            "serverZapPlayer": new Commands.CommandZapPlayer(controller),
            "serverUnzapPlayer": new Commands.CommandUnzapPlayer(controller),
            "serverRemovePlayer": new Commands.CommandRemovePlayer(controller),
            "serverLeave": new Commands.CommandLeave(controller),
            "serverTeamList": new Commands.CommandTeamList(controller),
            "serverGameList": new Commands.CommandGameList(controller),
            "serverUserSettings": new Commands.CommandUserSettings(controller),
            "serverTeamSetupList": new Commands.CommandTeamSetupList(controller),
            "serverAddSketches": new Commands.CommandAddSketches(controller),
            "serverRemoveSketches": new Commands.CommandRemoveSketches(controller),
            "serverSketchAddCoordinate": new Commands.CommandSketchAddCoordinate(controller),
            "serverSketchSetColor": new Commands.CommandSketchSetColor(controller),
            "serverSketchSetLabel": new Commands.CommandSketchSetLabel(controller),
            "serverClearSketches": new Commands.CommandClearSketches(controller),
            "serverSetPreventSketching": new Commands.CommandSetPreventSketching(controller),
        };
        this.network = network;
        this.controller = controller;
    }

    public handleCommand(data: any) {
        let commandId = data.netCommandId;

        let handler = this.commandHandlers[commandId];
        if (handler) {
            handler.processCommand(data);
        } else {
            console.log("Unknown command", commandId, data);
        }
    }
}
