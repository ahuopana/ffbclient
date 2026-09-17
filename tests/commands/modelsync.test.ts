import { CommandModelSync } from '../../commands';
import * as Core from '../../core';
import * as Model from '../../model';
import { EventType } from '../../types/eventlistener';

function makeControllerMock() {
    return {
        enqueueCommand: jest.fn(),
        triggerEvent: jest.fn(),
    } as unknown as Core.Controller;
}

function makeModelSyncData(modelChangeArray: FFB.Protocol.Messages.ModelChangeType[]): FFB.Protocol.Messages.ServerModelSync {
    return {
        netCommandId: 'serverModelSync',
        commandNr: 1,
        modelChangeList: { modelChangeArray },
        reportList: { reports: [], sound: null, turnTime: 0 },
        animation: [],
        sound: null,
        gameTime: 0,
        turnTime: 0,
    };
}

describe('CommandModelSync turn mode tracking', () => {
    test('gameSetTurnMode enqueues a command that updates the game turn mode', () => {
        let controller = makeControllerMock();
        let command = new CommandModelSync(controller);

        let data = makeModelSyncData([
            { modelChangeId: 'gameSetTurnMode', modelChangeKey: null, modelChangeValue: { name: 'kickoff' } },
        ]);

        command.processCommand(data);

        expect(controller.enqueueCommand).toHaveBeenCalledTimes(1);
        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];

        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getTurnMode()).toBe('kickoff');
        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.TurnModeChanged);
    });

    test('gameSetLastTurnMode enqueues a command that updates the last turn mode', () => {
        let controller = makeControllerMock();
        let command = new CommandModelSync(controller);

        let data = makeModelSyncData([
            { modelChangeId: 'gameSetLastTurnMode', modelChangeKey: null, modelChangeValue: { name: 'setup' } },
        ]);

        command.processCommand(data);

        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];
        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getLastTurnMode()).toBe('setup');
    });

    test('gameSetDialogParameter enqueues a command that updates the dialog parameter', () => {
        let controller = makeControllerMock();
        let command = new CommandModelSync(controller);

        let dialogParameter: FFB.Protocol.Messages.DialogParameter = {
            id: { name: 'COIN_TOSS_CHOICE' },
            value: { dialogId: { name: 'COIN_TOSS_CHOICE' } },
        };
        let data = makeModelSyncData([
            { modelChangeId: 'gameSetDialogParameter', modelChangeKey: null, modelChangeValue: dialogParameter },
        ]);

        command.processCommand(data);

        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];
        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.getDialogParameter()).toEqual(dialogParameter);
        expect(controller.triggerEvent).toHaveBeenCalledWith(EventType.TurnModeChanged);
    });

    test('gameSetSetupOffense enqueues a command that updates setupOffense', () => {
        let controller = makeControllerMock();
        let command = new CommandModelSync(controller);

        let data = makeModelSyncData([
            { modelChangeId: 'gameSetSetupOffense', modelChangeKey: null, modelChangeValue: true },
        ]);

        command.processCommand(data);

        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];
        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.isSetupOffense()).toBe(true);
    });

    test('gameSetWaitingForOpponent enqueues a command that updates waitingForOpponent', () => {
        let controller = makeControllerMock();
        let command = new CommandModelSync(controller);

        let data = makeModelSyncData([
            { modelChangeId: 'gameSetWaitingForOpponent', modelChangeKey: null, modelChangeValue: true },
        ]);

        command.processCommand(data);

        let enqueued = (controller.enqueueCommand as jest.Mock).mock.calls[0][0];
        let game = new Model.Game();
        enqueued.apply(game, controller);

        expect(game.isWaitingForOpponent()).toBe(true);
    });
});
