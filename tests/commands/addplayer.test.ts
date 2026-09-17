import { CommandAddPlayer } from '../../commands';
import * as Core from '../../core';
import { makeGameWithTeams, makePlayerData } from '../fixtures';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandAddPlayer', () => {
    test('enqueues a command that adds the player to the right team', () => {
        let controller = makeControllerMock();
        let command = new CommandAddPlayer(controller);

        let data: FFB.Protocol.Messages.ServerAddPlayer = {
            netCommandId: 'serverAddPlayer',
            commandNr: 1,
            teamId: 'home',
            player: makePlayerData('journeyman1'),
            playerState: 1,
            sendToBoxReason: null,
            sendToBoxTurn: 0,
            sendToBoxHalf: 0,
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = makeGameWithTeams();
        enqueued.apply(game, controller);

        let player = game.teamHome.getPlayer('journeyman1');
        expect(player).toBeDefined();
        expect(player.getState()).toBe(1);
        expect(game.teamAway.getPlayer('journeyman1')).toBeUndefined();
    });
});
