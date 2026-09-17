import { CommandReplayControl } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandReplayControl', () => {
    test('enqueues a command that records the controlling coach', () => {
        let controller = makeControllerMock();
        let command = new CommandReplayControl(controller);

        let data: FFB.Protocol.Messages.ServerReplayControl = {
            netCommandId: 'serverReplayControl',
            coach: 'BattleLore',
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getReplayInfo().getControllingCoach()).toBe('BattleLore');
    });
});
