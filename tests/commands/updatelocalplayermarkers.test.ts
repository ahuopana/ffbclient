import { CommandUpdateLocalPlayerMarkers } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';
import { makeTeamData, makePlayerData } from '../fixtures';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandUpdateLocalPlayerMarkers', () => {
    test('enqueues a command that sets marker text on the matching player', () => {
        let controller = makeControllerMock();
        let command = new CommandUpdateLocalPlayerMarkers(controller);

        let data: FFB.Protocol.Messages.ServerUpdateLocalPlayerMarkers = {
            netCommandId: 'serverUpdateLocalPlayerMarkers',
            commandNr: 1,
            playerMarkerArray: [
                { playerId: 'p1', homeText: 'MVP', awayText: '' },
            ],
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        game.teamHome = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
        game.teamAway = new Model.Team(game, makeTeamData('away'));

        enqueued.apply(game, controller);

        expect(game.getPlayer('p1').getHomeMarkerText()).toBe('MVP');
        expect(game.getPlayer('p1').getAwayMarkerText()).toBe('');
    });
});
