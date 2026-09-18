import * as Model from '../../model';
import { Coordinate } from '../../types/coordinate';
import { makeGameWithTeams, makeTeamData, makePlayerData } from '../fixtures';

describe('Game', () => {
    describe('getTeamById', () => {
        test('returns the home team when its id matches', () => {
            let game = makeGameWithTeams('home', 'away');

            expect(game.getTeamById('home')).toBe(game.teamHome);
        });

        test('returns the away team when its id matches', () => {
            let game = makeGameWithTeams('home', 'away');

            expect(game.getTeamById('away')).toBe(game.teamAway);
        });

        test('returns null when no team matches', () => {
            let game = makeGameWithTeams('home', 'away');

            expect(game.getTeamById('nonexistent')).toBeNull();
        });
    });

    describe('getTeamBySide', () => {
        test('returns the home team for Side.Home', () => {
            let game = makeGameWithTeams('home', 'away');

            expect(game.getTeamBySide(Model.Side.Home)).toBe(game.teamHome);
        });

        test('returns the away team for Side.Away', () => {
            let game = makeGameWithTeams('home', 'away');

            expect(game.getTeamBySide(Model.Side.Away)).toBe(game.teamAway);
        });
    });

    describe('removePlayer', () => {
        test('removes a player from whichever team has it', () => {
            let game = new Model.Game();
            game.teamHome = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
            game.teamAway = new Model.Team(game, makeTeamData('away', [makePlayerData('p2')]));

            game.removePlayer('p2');

            expect(game.getPlayer('p1')).toBeDefined();
            expect(game.getPlayer('p2')).toBeUndefined();
        });

        test('does nothing when the player does not exist', () => {
            let game = makeGameWithTeams();

            expect(() => game.removePlayer('nonexistent')).not.toThrow();
        });
    });

    describe('turnMode / dialogParameter tracking', () => {
        test('turnMode round-trips', () => {
            let game = new Model.Game();
            game.setTurnMode('kickoff');

            expect(game.getTurnMode()).toBe('kickoff');
        });

        test('lastTurnMode round-trips', () => {
            let game = new Model.Game();
            game.setLastTurnMode('setup');

            expect(game.getLastTurnMode()).toBe('setup');
        });

        test('dialogParameter round-trips', () => {
            let game = new Model.Game();
            let dialogParameter = { dialogId: { name: 'COIN_TOSS_CHOICE' } };
            game.setDialogParameter(dialogParameter);

            expect(game.getDialogParameter()).toBe(dialogParameter);
        });

        test('setupOffense defaults to false and round-trips', () => {
            let game = new Model.Game();
            expect(game.isSetupOffense()).toBe(false);

            game.setSetupOffense(true);

            expect(game.isSetupOffense()).toBe(true);
        });

        test('waitingForOpponent defaults to false and round-trips', () => {
            let game = new Model.Game();
            expect(game.isWaitingForOpponent()).toBe(false);

            game.setWaitingForOpponent(true);

            expect(game.isWaitingForOpponent()).toBe(true);
        });
    });

    describe('getPregameStatusText', () => {
        test('returns null outside any pregame phase', () => {
            let game = new Model.Game();
            game.setTurnMode('regular');

            expect(game.getPregameStatusText()).toBeNull();
        });

        test('returns null when nothing has been set yet', () => {
            let game = new Model.Game();

            expect(game.getPregameStatusText()).toBeNull();
        });

        test('reports a generic setup message when no team is resolvable', () => {
            let game = new Model.Game();
            game.setTurnMode('setup');

            expect(game.getPregameStatusText()).toBe('Setting up teams...');
        });

        test('reports which team is setting up, its role, and on-field progress', () => {
            let game = makeGameWithTeams('home', 'away');
            game.setTurnMode('setup');
            game.setPlayingSide(Model.Side.Away);
            game.setSetupOffense(false);
            game.teamAway.addPlayer(makePlayerData('p1'));
            game.teamAway.addPlayer(makePlayerData('p2'));
            game.getPlayer('p1').setLocation(new Coordinate(3, 3));

            expect(game.getPregameStatusText()).toBe('Team away is setting up (defense) - 1/2 on the field...');
        });

        test('reports the offense role during the second setup pass', () => {
            let game = makeGameWithTeams('home', 'away');
            game.setTurnMode('setup');
            game.setPlayingSide(Model.Side.Home);
            game.setSetupOffense(true);

            expect(game.getPregameStatusText()).toBe('Team home is setting up (offense) - 0/0 on the field...');
        });

        test('reports the start-game phase', () => {
            let game = new Model.Game();
            game.setTurnMode('startGame');

            expect(game.getPregameStatusText()).toBe('Starting game...');
        });

        test('reports kickoff', () => {
            let game = new Model.Game();
            game.setTurnMode('kickoff');

            expect(game.getPregameStatusText()).toBe('Kicking off...');
        });

        test('reports the coin toss regardless of turn mode', () => {
            let game = new Model.Game();
            game.setTurnMode('startGame');
            game.setDialogParameter({ id: { name: 'COIN_TOSS_CHOICE' }, value: { dialogId: { name: 'COIN_TOSS_CHOICE' } } });

            expect(game.getPregameStatusText()).toBe('Coin toss...');
        });

        test('reports the receive choice with the choosing team\'s name', () => {
            let game = makeGameWithTeams('home', 'away');
            game.setTurnMode('startGame');
            game.setDialogParameter({
                id: { name: 'RECEIVE_CHOICE' },
                value: { dialogId: { name: 'RECEIVE_CHOICE' }, teamId: 'away' },
            });

            expect(game.getPregameStatusText()).toBe('Team away is choosing to kick or receive...');
        });

        test('falls back to a generic label when the receive choice team is unknown', () => {
            let game = makeGameWithTeams('home', 'away');
            game.setDialogParameter({
                id: { name: 'RECEIVE_CHOICE' },
                value: { dialogId: { name: 'RECEIVE_CHOICE' }, teamId: 'nonexistent' },
            });

            expect(game.getPregameStatusText()).toBe('A team is choosing to kick or receive...');
        });
    });
});
