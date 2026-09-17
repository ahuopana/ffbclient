import { CommandAdminMessage } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandAdminMessage', () => {
    test('enqueues a command that appends the messages to the game log', () => {
        let controller = makeControllerMock();
        let command = new CommandAdminMessage(controller);

        let data: FFB.Protocol.Messages.ServerAdminMessage = {
            netCommandId: 'serverAdminMessage',
            commandNr: 1,
            messageArray: ['Server restarting in 5 minutes.'],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getAdminMessages()).toEqual(['Server restarting in 5 minutes.']);

        // A second batch should append, not replace.
        let data2: FFB.Protocol.Messages.ServerAdminMessage = {
            netCommandId: 'serverAdminMessage',
            commandNr: 2,
            messageArray: ['Restart complete.'],
        };
        let command2 = new CommandAdminMessage(controller);
        command2.processCommand(data2);
        let enqueued2 = (controller.enqueueCommand as jest.Mock).mock.calls[1][0];
        enqueued2.apply(game, controller);

        expect(game.getAdminMessages()).toEqual([
            'Server restarting in 5 minutes.',
            'Restart complete.',
        ]);
    });
});
