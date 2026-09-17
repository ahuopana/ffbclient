import { CommandAutomaticPlayerMarkings } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandAutomaticPlayerMarkings', () => {
    test('enqueues a command that records the markings and selected index', () => {
        let controller = makeControllerMock();
        let command = new CommandAutomaticPlayerMarkings(controller);

        let data: FFB.Protocol.Messages.ServerAutomaticPlayerMarkings = {
            netCommandId: 'serverAutomaticPlayerMarkings',
            commandNr: 1,
            selectedIndex: 2,
            markings: { p1: 'A', p2: 'B' },
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getAutomaticPlayerMarkings()).toEqual({
            index: 2,
            markings: { p1: 'A', p2: 'B' },
        });
    });
});
