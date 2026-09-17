import * as Model from '../model';

export function makePlayerData(playerId: string, overrides: Partial<FFB.Protocol.Messages.PlayerType> = {}): FFB.Protocol.Messages.PlayerType {
    return {
        agility: 3,
        armour: 8,
        lastingInjuries: [],
        movement: 6,
        nrOfIcons: 1,
        playerGender: 'Male',
        playerId: playerId,
        playerName: 'Player ' + playerId,
        playerNr: 1,
        playerType: 'PLAYER',
        positionIconIndex: 0,
        positionId: 'pos1',
        recoveringInjury: null,
        skillArray: [],
        strength: 3,
        urlIconSet: '',
        urlPortrait: '',
        ...overrides,
    };
}

export function makeTeamData(teamId: string, playerArray: FFB.Protocol.Messages.PlayerType[] = []): FFB.Protocol.Messages.TeamType {
    return {
        apothecaries: 0,
        assistantCoaches: 0,
        baseIconPath: '',
        cheerleaders: 0,
        coach: 'Coach',
        fanFactor: 0,
        logoUrl: '',
        playerArray: playerArray,
        race: '',
        reRolls: 0,
        roster: {
            apothecary: false,
            baseIconPath: '',
            logoUrl: '',
            maxReRolls: 0,
            necromancer: false,
            positionArray: [],
            raisedPositionId: null,
            reRollCost: 0,
            rosterId: 'roster-' + teamId,
            rosterName: 'Roster',
            undead: false,
        },
        teamId: teamId,
        teamName: 'Team ' + teamId,
        teamValue: 0,
        treasury: 0,
    };
}

export function makeGameWithTeams(homeTeamId = 'home', awayTeamId = 'away'): Model.Game {
    let game = new Model.Game();
    game.teamHome = new Model.Team(game, makeTeamData(homeTeamId));
    game.teamAway = new Model.Team(game, makeTeamData(awayTeamId));
    return game;
}
