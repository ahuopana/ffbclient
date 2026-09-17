import { CommandRemovePlayer } from '../../commands';
import * as Core from '../../core';
import { makeTeamData, makePlayerData } from '../fixtures';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandRemovePlayer', () => {
    test('enqueues a command that removes the player from its team', () => {
        let controller = makeControllerMock();
        let command = new CommandRemovePlayer(controller);

        let data: FFB.Protocol.Messages.ServerRemovePlayer = {
            netCommandId: 'serverRemovePlayer',
            commandNr: 1,
            playerId: 'p1',
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        game.teamHome = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
        game.teamAway = new Model.Team(game, makeTeamData('away'));

        expect(game.getPlayer('p1')).toBeDefined();

        enqueued.apply(game, controller);

        expect(game.getPlayer('p1')).toBeUndefined();
    });
});
