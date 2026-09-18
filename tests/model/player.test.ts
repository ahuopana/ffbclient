import * as Model from '../../model';
import { Coordinate } from '../../types/coordinate';
import { makeTeamData, makePlayerData } from '../fixtures';

describe('Player', () => {
    describe('isOnField', () => {
        test('is false when no location has been set yet', () => {
            let game = new Model.Game();
            let team = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));

            expect(team.getPlayer('p1').isOnField()).toBe(false);
        });

        test('is true once placed on a field coordinate', () => {
            let game = new Model.Game();
            let team = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
            let player = team.getPlayer('p1');

            player.setLocation(new Coordinate(5, 5));

            expect(player.isOnField()).toBe(true);
        });

        test('is false for an off-field (reserve box) coordinate', () => {
            let game = new Model.Game();
            let team = new Model.Team(game, makeTeamData('home', [makePlayerData('p1')]));
            let player = team.getPlayer('p1');

            player.setLocation(new Coordinate(-1, -1));

            expect(player.isOnField()).toBe(false);
        });
    });
});
