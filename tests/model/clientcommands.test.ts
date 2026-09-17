import * as Model from '../../model';
import * as Core from '../../core';
import * as ClientCommands from '../../model/clientcommands';
import { EventType } from '../../types/eventlistener';

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
