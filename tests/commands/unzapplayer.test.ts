import { CommandUnzapPlayer } from '../../commands';
import * as Core from '../../core';
import { makeTeamData, makePlayerData } from '../fixtures';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandUnzapPlayer', () => {
    test('enqueues a command that clears the zapped flag', () => {
        let controller = makeControllerMock();
        let command = new CommandUnzapPlayer(controller);

        let data: FFB.Protocol.Messages.ServerUnzapPlayer = {
            netCommandId: 'serverUnzapPlayer',
            commandNr: 1,
            teamId: 'home',
            playerId: 'p1',
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        game.teamHome = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
        game.teamAway = new Model.Team(game, makeTeamData('away'));
        game.getPlayer('p1').setZapped(true);

        enqueued.apply(game, controller);

        expect(game.getPlayer('p1').isZapped()).toBe(false);
    });
});
