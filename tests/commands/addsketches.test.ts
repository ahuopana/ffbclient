import { CommandAddSketches } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandAddSketches', () => {
    test('enqueues a command that adds sketches reachable by id', () => {
        let controller = makeControllerMock();
        let command = new CommandAddSketches(controller);

        let data: FFB.Protocol.Messages.ServerAddSketches = {
            netCommandId: 'serverAddSketches',
            coach: 'BattleLore',
            sketches: [
                { id: 'sketch1', rgb: 0xff0000, text: null, fieldCoordinates: [{ x: 1, y: 2 }] },
            ],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getSketches()['sketch1']).toEqual(data.sketches[0]);
    });
});
