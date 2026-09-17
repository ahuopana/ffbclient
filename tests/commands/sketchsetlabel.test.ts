import { CommandSketchSetLabel } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandSketchSetLabel', () => {
    test('enqueues a command that sets the label on the given sketches', () => {
        let controller = makeControllerMock();
        let command = new CommandSketchSetLabel(controller);

        let data: FFB.Protocol.Messages.ServerSketchSetLabel = {
            netCommandId: 'serverSketchSetLabel',
            coach: 'BattleLore',
            ids: ['sketch1'],
            text: 'Wedge',
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        game.addSketches([{ id: 'sketch1', rgb: 0, text: null, fieldCoordinates: [] }]);

        enqueued.apply(game, controller);

        expect(game.getSketches()['sketch1'].text).toBe('Wedge');
    });
});
