import { CommandGameList } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandGameList', () => {
    test('enqueues a command that records the game list', () => {
        let controller = makeControllerMock();
        let command = new CommandGameList(controller);

        let data: FFB.Protocol.Messages.ServerGameList = {
            netCommandId: 'serverGameList',
            commandNr: 1,
            gameList: {
                gameListEntries: [
                    {
                        gameId: 123,
                        started: '2026-01-01T00:00:00.000Z',
                        teamHomeId: 'home',
                        teamHomeName: 'Kalimars Elves',
                        teamHomeCoach: 'Kalimar',
                        teamAwayId: 'away',
                        teamAwayName: 'BattleLores Orcs',
                        teamAwayCoach: 'BattleLore',
                    },
                ],
            },
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().getGameList()).toEqual(data.gameList.gameListEntries);
    });

    test('handles a missing game list gracefully', () => {
        let controller = makeControllerMock();
        let command = new CommandGameList(controller);

        let data: FFB.Protocol.Messages.ServerGameList = {
            netCommandId: 'serverGameList',
            commandNr: 1,
            gameList: null,
        };

        command.processCommand(data);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        expect(() => enqueued.apply(game, controller)).not.toThrow();
        expect(game.getConnectionInfo().getGameList()).toEqual([]);
    });
});
