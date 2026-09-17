import { CommandTeamList } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('CommandTeamList', () => {
    test('enqueues a command that records the team list', () => {
        let controller = makeControllerMock();
        let command = new CommandTeamList(controller);

        let data: FFB.Protocol.Messages.ServerTeamList = {
            netCommandId: 'serverTeamList',
            commandNr: 1,
            teamList: {
                coach: 'BattleLore',
                teamListEntries: [
                    {
                        teamId: 'team1',
                        teamStatus: { name: 'ACTIVE' },
                        division: '1',
                        teamName: 'Bauernopfer',
                        teamValue: 1000,
                        race: 'Elf',
                        treasury: 0,
                    },
                ],
            },
        };

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getConnectionInfo().getTeamList()).toEqual(data.teamList.teamListEntries);
    });

    test('handles a missing team list gracefully', () => {
        let controller = makeControllerMock();
        let command = new CommandTeamList(controller);

        let data: FFB.Protocol.Messages.ServerTeamList = {
            netCommandId: 'serverTeamList',
            commandNr: 1,
            teamList: null,
        };

        command.processCommand(data);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        expect(() => enqueued.apply(game, controller)).not.toThrow();
        expect(game.getConnectionInfo().getTeamList()).toEqual([]);
    });
});
