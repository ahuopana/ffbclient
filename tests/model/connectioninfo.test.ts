import { ConnectionInfo } from '../../model';

describe('ConnectionInfo', () => {
    describe('initial state', () => {
        let connectionInfo = new ConnectionInfo();

        test('is not joined', () => {
            expect(connectionInfo.isJoined()).toBe(false);
        });

        test('has no version mismatch', () => {
            expect(connectionInfo.hasVersionMismatch()).toBe(false);
        });

        test('is considered available (no status received yet)', () => {
            expect(connectionInfo.isServerAvailable()).toBe(true);
        });

        test('has no password challenge issued', () => {
            expect(connectionInfo.isPasswordChallengeIssued()).toBe(false);
        });
    });

    describe('setJoined', () => {
        let connectionInfo = new ConnectionInfo();
        let joinData: FFB.Protocol.Messages.ServerJoin = {
            netCommandId: 'serverJoin',
            coach: 'BattleLore',
            clientMode: 'spectator',
            playerNames: ['Kalimar'],
            spectatorNames: ['LordCrunchy'],
            spectators: 1,
            name: 'Friendly match',
        };

        connectionInfo.setJoined(joinData);

        test('marks the connection as joined', () => {
            expect(connectionInfo.isJoined()).toBe(true);
        });

        test('stores the coach name', () => {
            expect(connectionInfo.getCoach()).toBe('BattleLore');
        });

        test('stores the client mode', () => {
            expect(connectionInfo.getClientMode()).toBe('spectator');
        });

        test('stores the player names', () => {
            expect(connectionInfo.getPlayerNames()).toEqual(['Kalimar']);
        });

        test('stores the spectator names', () => {
            expect(connectionInfo.getSpectatorNames()).toEqual(['LordCrunchy']);
        });

        test('stores the spectator count', () => {
            expect(connectionInfo.getSpectators()).toBe(1);
        });

        test('stores the game name', () => {
            expect(connectionInfo.getGameName()).toBe('Friendly match');
        });

        test('defaults missing arrays to empty lists', () => {
            let sparse = new ConnectionInfo();
            sparse.setJoined({
                netCommandId: 'serverJoin',
                coach: 'BattleLore',
                clientMode: 'spectator',
                playerNames: undefined,
                spectatorNames: undefined,
                spectators: 0,
                name: 'Friendly match',
            });

            expect(sparse.getPlayerNames()).toEqual([]);
            expect(sparse.getSpectatorNames()).toEqual([]);
        });
    });

    describe('setServerStatus', () => {
        test('reports the server as available when status is OK', () => {
            let connectionInfo = new ConnectionInfo();
            connectionInfo.setServerStatus('OK', 'All good');

            expect(connectionInfo.getServerStatus()).toBe('OK');
            expect(connectionInfo.getServerStatusMessage()).toBe('All good');
            expect(connectionInfo.isServerAvailable()).toBe(true);
        });

        test('reports the server as unavailable for any other status', () => {
            let connectionInfo = new ConnectionInfo();
            connectionInfo.setServerStatus('MAINTENANCE', 'Down for maintenance');

            expect(connectionInfo.isServerAvailable()).toBe(false);
            expect(connectionInfo.getServerStatusMessage()).toBe('Down for maintenance');
        });
    });

    describe('setServerVersion', () => {
        test('detects matching versions as no mismatch', () => {
            let connectionInfo = new ConnectionInfo();
            connectionInfo.setServerVersion('1.2.3', '1.2.3');

            expect(connectionInfo.getServerVersion()).toBe('1.2.3');
            expect(connectionInfo.getClientVersion()).toBe('1.2.3');
            expect(connectionInfo.hasVersionMismatch()).toBe(false);
        });

        test('detects differing versions as a mismatch', () => {
            let connectionInfo = new ConnectionInfo();
            connectionInfo.setServerVersion('1.2.3', '1.2.4');

            expect(connectionInfo.hasVersionMismatch()).toBe(true);
        });

        test('does not flag a mismatch when either version is missing', () => {
            let connectionInfo = new ConnectionInfo();
            connectionInfo.setServerVersion(null, null);

            expect(connectionInfo.hasVersionMismatch()).toBe(false);
        });
    });

    describe('setPasswordChallengeIssued', () => {
        test('flips the flag on', () => {
            let connectionInfo = new ConnectionInfo();
            connectionInfo.setPasswordChallengeIssued(true);

            expect(connectionInfo.isPasswordChallengeIssued()).toBe(true);
        });
    });
});
