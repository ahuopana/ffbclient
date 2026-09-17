import { CommandLeave } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandLeave', () => {
    test('enqueues a command that updates the spectator roster', () => {
        let controller = makeControllerMock();
        let command = new CommandLeave(controller);

        let data: FFB.Protocol.Messages.ServerLeave = {
            netCommandId: 'serverLeave',
            commandNr: 1,
            coach: 'BattleLore',
            clientMode: 'spectator',
            spectators: 1,
            spectatorNames: ['LordCrunchy'],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().getSpectatorNames()).toEqual(['LordCrunchy']);
        expect(game.getConnectionInfo().getSpectators()).toBe(1);
    });
});
