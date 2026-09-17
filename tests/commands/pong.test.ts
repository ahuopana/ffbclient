import { CommandPong } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandPong', () => {
    test('enqueues a command that records the pong timestamp', () => {
        let controller = makeControllerMock();
        let command = new CommandPong(controller);

        let data: FFB.Protocol.Messages.ServerPong = {
            netCommandId: 'serverPong',
            timestamp: 1700000000000,
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().getLastPongTimestamp()).toBe(1700000000000);
    });
});
