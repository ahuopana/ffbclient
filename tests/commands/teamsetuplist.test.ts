import { CommandTeamSetupList } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandTeamSetupList', () => {
    test('enqueues a command that records the saved setup names', () => {
        let controller = makeControllerMock();
        let command = new CommandTeamSetupList(controller);

        let data: FFB.Protocol.Messages.ServerTeamSetupList = {
            netCommandId: 'serverTeamSetupList',
            commandNr: 1,
            setupNames: ['Wedge', 'Line of Scrimmage'],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().getTeamSetupNames()).toEqual(['Wedge', 'Line of Scrimmage']);
    });
});
