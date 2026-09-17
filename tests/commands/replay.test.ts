import { CommandReplay } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
        handleReplayedCommand: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandReplay', () => {
    test('enqueues a command that re-dispatches each replayed command through the normal pipeline', () => {
        let controller = makeControllerMock();
        let command = new CommandReplay(controller);

        let nestedCommandA = { netCommandId: 'serverStatus', serverStatus: 'OK', message: '' };
        let nestedCommandB = { netCommandId: 'serverGameTime', gameTime: 10, turnTime: 5 };

        let data: FFB.Protocol.Messages.ServerReplay = {
            netCommandId: 'serverReplay',
            commandNr: 1,
            totalNrOfCommands: 2,
            commandArray: [nestedCommandA, nestedCommandB],
            lastCommand: true,
            markingIntervalIndexes: [],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(controller.handleReplayedCommand).toHaveBeenCalledTimes(2);
        expect(controller.handleReplayedCommand).toHaveBeenNthCalledWith(1, nestedCommandA);
        expect(controller.handleReplayedCommand).toHaveBeenNthCalledWith(2, nestedCommandB);
    });
});
