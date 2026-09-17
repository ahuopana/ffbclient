import { CommandRemoveSketches } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandRemoveSketches', () => {
    test('enqueues a command that removes the given sketches', () => {
        let controller = makeControllerMock();
        let command = new CommandRemoveSketches(controller);

        let data: FFB.Protocol.Messages.ServerRemoveSketches = {
            netCommandId: 'serverRemoveSketches',
            coach: 'BattleLore',
            ids: ['sketch1'],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        game.addSketches([{ id: 'sketch1', rgb: 0, text: null, fieldCoordinates: [] }]);

        enqueued.apply(game, controller);

        expect(game.getSketches()['sketch1']).toBeUndefined();
    });
});
