import { CommandStatus } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandStatus', () => {
    test('enqueues a command that records the server status', () => {
        let controller = makeControllerMock();
        let command = new CommandStatus(controller);

        let data: FFB.Protocol.Messages.ServerStatus = {
            netCommandId: 'serverStatus',
            serverStatus: 'MAINTENANCE',
            message: 'Down for maintenance',
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().getServerStatus()).toBe('MAINTENANCE');
        expect(game.getConnectionInfo().getServerStatusMessage()).toBe('Down for maintenance');
        expect(game.getConnectionInfo().isServerAvailable()).toBe(false);
    });
});
