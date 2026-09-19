import { CommandPasswordChallenge } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
        respondToPasswordChallenge: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandPasswordChallenge', () => {
    test('enqueues a command that flags the password challenge as issued', () => {
        let controller = makeControllerMock();
        let command = new CommandPasswordChallenge(controller);

        let data: FFB.Protocol.Messages.ServerPasswordChallenge = {
            netCommandId: 'serverPasswordChallenge',
            challenge: 'abc123',
        };

        command.processCommand(data);

        expect(controller.respondToPasswordChallenge).toHaveBeenCalledWith('abc123');
        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        expect(game.getConnectionInfo().isPasswordChallengeIssued()).toBe(false);

        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().isPasswordChallengeIssued()).toBe(true);
    });
});
