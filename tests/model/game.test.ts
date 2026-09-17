import * as Model from '../../model';
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
});
