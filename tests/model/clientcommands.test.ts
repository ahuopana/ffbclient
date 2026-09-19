import * as Model from '../../model';
import * as Core from '../../core';
import * as ClientCommands from '../../model/clientcommands';
import { EventType } from '../../types/eventlistener';
import { makeGameWithTeams, makeTeamData, makePlayerData } from '../fixtures';

function makeControllerMock() {
    return {
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

describe('SetJoinInfo', () => {
    let game: Model.Game;
    let controller: Core.Controller;
    let joinData: FFB.Protocol.Messages.ServerJoin;

    beforeEach(() => {
        game = new Model.Game();
        controller = makeControllerMock();
        joinData = {
            netCommandId: 'serverJoin',
            coach: 'BattleLore',
            clientMode: 'spectator',
            playerNames: [],
            spectatorNames: [],
            spectators: 0,
            name: 'Friendly match',
        };
    });

    test('records the join info on the game\'s connection info', () => {
        let command = new ClientCommands.SetJoinInfo(joinData);
        command.apply(game, controller);

        expect(game.getConnectionInfo().isJoined()).toBe(true);
        expect(game.getConnectionInfo().getCoach()).toBe('BattleLore');
    });

    test('triggers ConnectionInfoChanged', () => {
        let command = new ClientCommands.SetJoinInfo(joinData);
        command.apply(game, controller);

        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.ConnectionInfoChanged);
    });

    test('does not request a field redraw', () => {
        let command = new ClientCommands.SetJoinInfo(joinData);
        expect(command.triggerModelChanged).toBe(false);
    });
});

describe('SetServerStatus', () => {
    let game: Model.Game;
    let controller: Core.Controller;

    beforeEach(() => {
        game = new Model.Game();
        controller = makeControllerMock();
    });

    test('records the status and message', () => {
        let command = new ClientCommands.SetServerStatus('MAINTENANCE', 'Down for maintenance');
        command.apply(game, controller);

        expect(game.getConnectionInfo().getServerStatus()).toBe('MAINTENANCE');
        expect(game.getConnectionInfo().getServerStatusMessage()).toBe('Down for maintenance');
        expect(game.getConnectionInfo().isServerAvailable()).toBe(false);
    });

    test('triggers ConnectionInfoChanged', () => {
        let command = new ClientCommands.SetServerStatus('OK', 'All good');
        command.apply(game, controller);

        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.ConnectionInfoChanged);
    });
});

describe('SetServerVersion', () => {
    let game: Model.Game;
    let controller: Core.Controller;

    beforeEach(() => {
        game = new Model.Game();
        controller = makeControllerMock();
    });

    test('records the server and client versions', () => {
        let command = new ClientCommands.SetServerVersion('1.2.3', '1.2.3');
        command.apply(game, controller);

        expect(game.getConnectionInfo().getServerVersion()).toBe('1.2.3');
        expect(game.getConnectionInfo().getClientVersion()).toBe('1.2.3');
        expect(game.getConnectionInfo().hasVersionMismatch()).toBe(false);
    });

    test('detects a version mismatch', () => {
        let command = new ClientCommands.SetServerVersion('1.2.3', '1.2.4');
        command.apply(game, controller);

        expect(game.getConnectionInfo().hasVersionMismatch()).toBe(true);
    });

    test('triggers ConnectionInfoChanged', () => {
        let command = new ClientCommands.SetServerVersion('1.2.3', '1.2.3');
        command.apply(game, controller);

        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.ConnectionInfoChanged);
    });
});

describe('SetPasswordChallengeIssued', () => {
    let game: Model.Game;
    let controller: Core.Controller;

    beforeEach(() => {
        game = new Model.Game();
        controller = makeControllerMock();
    });

    test('flags the password challenge as issued', () => {
        let command = new ClientCommands.SetPasswordChallengeIssued();
        command.apply(game, controller);

        expect(game.getConnectionInfo().isPasswordChallengeIssued()).toBe(true);
    });

    test('triggers ConnectionInfoChanged', () => {
        let command = new ClientCommands.SetPasswordChallengeIssued();
        command.apply(game, controller);

        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.ConnectionInfoChanged);
    });
});

describe('SetConnectionError', () => {
    let game: Model.Game;
    let controller: Core.Controller;

    beforeEach(() => {
        game = new Model.Game();
        controller = makeControllerMock();
    });

    test('records the connection error message', () => {
        let command = new ClientCommands.SetConnectionError('Could not connect to ws://example.com:22223 - check the server address');
        command.apply(game, controller);

        expect(game.getConnectionInfo().getConnectionError()).toBe(
            'Could not connect to ws://example.com:22223 - check the server address'
        );
    });

    test('triggers ConnectionInfoChanged', () => {
        let command = new ClientCommands.SetConnectionError('failed');
        command.apply(game, controller);

        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.ConnectionInfoChanged);
    });
});

describe('AddPlayer', () => {
    test('adds the player to the team named in the message', () => {
        let game = makeGameWithTeams('home', 'away');
        let controller = makeControllerMock();

        let data: FFB.Protocol.Messages.ServerAddPlayer = {
            netCommandId: 'serverAddPlayer',
            commandNr: 1,
            teamId: 'away',
            player: makePlayerData('newplayer'),
            playerState: 9,
            sendToBoxReason: null,
            sendToBoxTurn: 0,
            sendToBoxHalf: 0,
        };

        let command = new ClientCommands.AddPlayer(data);
        command.apply(game, controller);

        let player = game.teamAway.getPlayer('newplayer');
        expect(player).toBeDefined();
        expect(player.getState()).toBe(9);
        expect(game.teamHome.getPlayer('newplayer')).toBeUndefined();
    });

    test('does nothing when the team id does not match either team', () => {
        let game = makeGameWithTeams('home', 'away');
        let controller = makeControllerMock();

        let data: FFB.Protocol.Messages.ServerAddPlayer = {
            netCommandId: 'serverAddPlayer',
            commandNr: 1,
            teamId: 'nonexistent',
            player: makePlayerData('newplayer'),
            playerState: 0,
            sendToBoxReason: null,
            sendToBoxTurn: 0,
            sendToBoxHalf: 0,
        };

        let command = new ClientCommands.AddPlayer(data);
        expect(() => command.apply(game, controller)).not.toThrow();
        expect(game.getPlayer('newplayer')).toBeUndefined();
    });
});

describe('RemovePlayer', () => {
    test('removes the player from whichever team has it', () => {
        let game = new Model.Game();
        game.teamHome = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
        game.teamAway = new Model.Team(game, makeTeamData('away'));
        let controller = makeControllerMock();

        let data: FFB.Protocol.Messages.ServerRemovePlayer = {
            netCommandId: 'serverRemovePlayer',
            commandNr: 1,
            playerId: 'p1',
        };

        let command = new ClientCommands.RemovePlayer(data);
        command.apply(game, controller);

        expect(game.getPlayer('p1')).toBeUndefined();
    });
});

describe('SetPlayerZapped', () => {
    test('marks the player zapped', () => {
        let game = new Model.Game();
        game.teamHome = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
        game.teamAway = new Model.Team(game, makeTeamData('away'));
        let controller = makeControllerMock();

        let data: FFB.Protocol.Messages.ServerZapPlayer = {
            netCommandId: 'serverZapPlayer',
            commandNr: 1,
            teamId: 'home',
            playerId: 'p1',
        };

        let command = new ClientCommands.SetPlayerZapped(data, true);
        command.apply(game, controller);

        expect(game.getPlayer('p1').isZapped()).toBe(true);
    });

    test('clears the zapped flag', () => {
        let game = new Model.Game();
        game.teamHome = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
        game.teamAway = new Model.Team(game, makeTeamData('away'));
        game.getPlayer('p1').setZapped(true);
        let controller = makeControllerMock();

        let data: FFB.Protocol.Messages.ServerUnzapPlayer = {
            netCommandId: 'serverUnzapPlayer',
            commandNr: 1,
            teamId: 'home',
            playerId: 'p1',
        };

        let command = new ClientCommands.SetPlayerZapped(data, false);
        command.apply(game, controller);

        expect(game.getPlayer('p1').isZapped()).toBe(false);
    });

    test('does nothing when the team id does not match either team', () => {
        let game = new Model.Game();
        game.teamHome = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
        game.teamAway = new Model.Team(game, makeTeamData('away'));
        let controller = makeControllerMock();

        let data: FFB.Protocol.Messages.ServerZapPlayer = {
            netCommandId: 'serverZapPlayer',
            commandNr: 1,
            teamId: 'nonexistent',
            playerId: 'p1',
        };

        let command = new ClientCommands.SetPlayerZapped(data, true);
        expect(() => command.apply(game, controller)).not.toThrow();
    });
});

describe('SetTurnMode', () => {
    test('sets the turn mode and triggers TurnModeChanged', () => {
        let game = new Model.Game();
        let controller = makeControllerMock();

        let command = new ClientCommands.SetTurnMode('kickoff');
        command.apply(game, controller);

        expect(game.getTurnMode()).toBe('kickoff');
        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.TurnModeChanged);
    });

    test('undo restores the previous turn mode', () => {
        let game = new Model.Game();
        game.setTurnMode('setup');
        let controller = makeControllerMock();

        let command = new ClientCommands.SetTurnMode('kickoff');
        command.apply(game, controller);
        command.undo();

        expect(game.getTurnMode()).toBe('setup');
    });
});

describe('SetLastTurnMode', () => {
    test('sets the last turn mode', () => {
        let game = new Model.Game();
        let controller = makeControllerMock();

        let command = new ClientCommands.SetLastTurnMode('regular');
        command.apply(game, controller);

        expect(game.getLastTurnMode()).toBe('regular');
    });

    test('undo restores the previous last turn mode', () => {
        let game = new Model.Game();
        game.setLastTurnMode('setup');
        let controller = makeControllerMock();

        let command = new ClientCommands.SetLastTurnMode('regular');
        command.apply(game, controller);
        command.undo();

        expect(game.getLastTurnMode()).toBe('setup');
    });
});

describe('SetDialogParameter', () => {
    test('sets the dialog parameter and triggers TurnModeChanged', () => {
        let game = new Model.Game();
        let controller = makeControllerMock();
        let dialogParameter = { dialogId: { name: 'COIN_TOSS_CHOICE' } };

        let command = new ClientCommands.SetDialogParameter(dialogParameter);
        command.apply(game, controller);

        expect(game.getDialogParameter()).toBe(dialogParameter);
        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.TurnModeChanged);
    });

    test('undo restores the previous dialog parameter', () => {
        let game = new Model.Game();
        let oldParameter = { dialogId: { name: 'JOIN' } };
        game.setDialogParameter(oldParameter);
        let controller = makeControllerMock();

        let command = new ClientCommands.SetDialogParameter({ dialogId: { name: 'COIN_TOSS_CHOICE' } });
        command.apply(game, controller);
        command.undo();

        expect(game.getDialogParameter()).toBe(oldParameter);
    });
});

describe('SetSetupOffense', () => {
    test('sets setupOffense', () => {
        let game = new Model.Game();
        let controller = makeControllerMock();

        let command = new ClientCommands.SetSetupOffense(true);
        command.apply(game, controller);

        expect(game.isSetupOffense()).toBe(true);
    });

    test('undo restores the previous value', () => {
        let game = new Model.Game();
        let controller = makeControllerMock();

        let command = new ClientCommands.SetSetupOffense(true);
        command.apply(game, controller);
        command.undo();

        expect(game.isSetupOffense()).toBe(false);
    });
});

describe('SetWaitingForOpponent', () => {
    test('sets waitingForOpponent', () => {
        let game = new Model.Game();
        let controller = makeControllerMock();

        let command = new ClientCommands.SetWaitingForOpponent(true);
        command.apply(game, controller);

        expect(game.isWaitingForOpponent()).toBe(true);
    });

    test('undo restores the previous value', () => {
        let game = new Model.Game();
        let controller = makeControllerMock();

        let command = new ClientCommands.SetWaitingForOpponent(true);
        command.apply(game, controller);
        command.undo();

        expect(game.isWaitingForOpponent()).toBe(false);
    });
});
