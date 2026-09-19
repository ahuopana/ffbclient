import { applyServerOverride } from '../../core/network';

describe('applyServerOverride', () => {
    let defaultTarget = { host: 'dev.fumbbl.com', port: 22223, proto: 'ws:' };

    test('leaves the default target untouched when no server is given', () => {
        expect(applyServerOverride('', defaultTarget)).toEqual(defaultTarget);
        expect(applyServerOverride(undefined as any, defaultTarget)).toEqual(defaultTarget);
    });

    test('overrides just the host when only a host is given', () => {
        expect(applyServerOverride('localhost', defaultTarget)).toEqual({
            host: 'localhost',
            port: 22223,
            proto: 'ws:',
        });
    });

    test('overrides host and port when given as host:port', () => {
        expect(applyServerOverride('localhost:22227', defaultTarget)).toEqual({
            host: 'localhost',
            port: 22227,
            proto: 'ws:',
        });
    });

    test('overrides the protocol too when given a full ws(s):// URL', () => {
        expect(applyServerOverride('wss://example.com:22224', defaultTarget)).toEqual({
            host: 'example.com',
            port: 22224,
            proto: 'wss:',
        });
    });

    test('trims surrounding whitespace', () => {
        expect(applyServerOverride('  localhost:22227  ', defaultTarget)).toEqual({
            host: 'localhost',
            port: 22227,
            proto: 'ws:',
        });
    });
});
