import { CommandReplayStatus } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandReplayStatus', () => {
    test('enqueues a command that records the replay status', () => {
        let controller = makeControllerMock();
        let command = new CommandReplayStatus(controller);

        let data: FFB.Protocol.Messages.ServerReplayStatus = {
            netCommandId: 'serverReplayStatus',
            commandNr: 42,
            running: true,
            forward: false,
            speed: 2,
            skip: true,
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        let replayInfo = game.getReplayInfo();
        expect(replayInfo.getCommandNr()).toBe(42);
        expect(replayInfo.isRunning()).toBe(true);
        expect(replayInfo.isForward()).toBe(false);
        expect(replayInfo.getSpeed()).toBe(2);
        expect(replayInfo.isSkip()).toBe(true);
    });
});
