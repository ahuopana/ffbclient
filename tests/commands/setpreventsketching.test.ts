import { CommandSetPreventSketching } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandSetPreventSketching', () => {
    test('enqueues a command that flags sketching as prevented', () => {
        let controller = makeControllerMock();
        let command = new CommandSetPreventSketching(controller);

        let data: FFB.Protocol.Messages.ServerSetPreventSketching = {
            netCommandId: 'serverSetPreventSketching',
            coach: 'BattleLore',
            prevent: true,
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        expect(game.isSketchingPrevented()).toBe(false);

        enqueued.apply(game, controller);

        expect(game.isSketchingPrevented()).toBe(true);
    });
});
