import { CommandJoin } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandJoin', () => {
    test('enqueues a command that records the join info on the game state', () => {
        let controller = makeControllerMock();
        let command = new CommandJoin(controller);

        let data: FFB.Protocol.Messages.ServerJoin = {
            netCommandId: 'serverJoin',
            coach: 'BattleLore',
            clientMode: 'spectator',
            playerNames: ['Kalimar'],
            spectatorNames: [],
            spectators: 0,
            name: 'Friendly match',
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        // Apply the enqueued command against a fresh game to verify it does
        // what CommandJoin promised, without reaching into its private state.
        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().isJoined()).toBe(true);
        expect(game.getConnectionInfo().getCoach()).toBe('BattleLore');
        expect(game.getConnectionInfo().getPlayerNames()).toEqual(['Kalimar']);
    });
});
