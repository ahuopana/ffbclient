import { CommandSketchAddCoordinate } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandSketchAddCoordinate', () => {
    test('enqueues a command that appends a point to the sketch path', () => {
        let controller = makeControllerMock();
        let command = new CommandSketchAddCoordinate(controller);

        let data: FFB.Protocol.Messages.ServerSketchAddCoordinate = {
            netCommandId: 'serverSketchAddCoordinate',
            coach: 'BattleLore',
            id: 'sketch1',
            coordinate: [5, 6],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        game.addSketches([{ id: 'sketch1', rgb: 0, text: null, fieldCoordinates: [] }]);

        enqueued.apply(game, controller);

        expect(game.getSketches()['sketch1'].fieldCoordinates).toEqual([{ x: 5, y: 6 }]);
    });
});
