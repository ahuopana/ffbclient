import { CommandUserSettings } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandUserSettings', () => {
    test('enqueues a command that records the user settings as a name->value map', () => {
        let controller = makeControllerMock();
        let command = new CommandUserSettings(controller);

        let data: FFB.Protocol.Messages.ServerUserSettings = {
            netCommandId: 'serverUserSettings',
            commandNr: 1,
            userSettingNames: ['soundEnabled', 'animationSpeed'],
            userSettingValues: ['true', 'fast'],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().getUserSettings()).toEqual({
            soundEnabled: 'true',
            animationSpeed: 'fast',
        });
    });
});
