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
});
