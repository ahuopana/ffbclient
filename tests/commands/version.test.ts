import { CommandVersion } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandVersion', () => {
    test('enqueues a command that records server/client versions', () => {
        let controller = makeControllerMock();
        let command = new CommandVersion(controller);

        let data: FFB.Protocol.Messages.ServerVersion = {
            netCommandId: 'serverVersion',
            serverVersion: '5.5.0',
            clientVersion: '5.4.0',
            clientPropertyNames: [],
            clientPropertyValues: [],
            testing: false,
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().getServerVersion()).toBe('5.5.0');
        expect(game.getConnectionInfo().getClientVersion()).toBe('5.4.0');
        expect(game.getConnectionInfo().hasVersionMismatch()).toBe(true);
    });
});
