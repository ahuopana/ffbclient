import * as Model from '../../model';
import { makeTeamData, makePlayerData } from '../fixtures';

describe('Team', () => {
    test('getId returns the team id from the team data', () => {
        let game = new Model.Game();
        let team = new Model.Team(game, makeTeamData('home'));

        expect(team.getId()).toBe('home');
    });

    describe('addPlayer', () => {
        test('adds a new player reachable by id', () => {
            let game = new Model.Game();
            let team = new Model.Team(game, makeTeamData('home'));

            let player = team.addPlayer(makePlayerData('newplayer'));

            expect(player.getId()).toBe('newplayer');
            expect(team.getPlayer('newplayer')).toBe(player);
        });
    });

    describe('removePlayer', () => {
        test('removes a player from the team', () => {
            let game = new Model.Game();
            let team = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));

            expect(team.getPlayer('p1')).toBeDefined();

            team.removePlayer('p1');

            expect(team.getPlayer('p1')).toBeUndefined();
        });
    });
});
