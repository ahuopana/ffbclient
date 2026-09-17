import { CommandSketchSetColor } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandSketchSetColor', () => {
    test('enqueues a command that sets the color on the given sketches', () => {
        let controller = makeControllerMock();
        let command = new CommandSketchSetColor(controller);

        let data: FFB.Protocol.Messages.ServerSketchSetColor = {
            netCommandId: 'serverSketchSetColor',
            coach: 'BattleLore',
            ids: ['sketch1'],
            rgb: 0x00ff00,
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        game.addSketches([{ id: 'sketch1', rgb: 0, text: null, fieldCoordinates: [] }]);

        enqueued.apply(game, controller);

        expect(game.getSketches()['sketch1'].rgb).toBe(0x00ff00);
    });
});
