import * as crypto from 'crypto';
import { md5Encode, createResponse, createChallengeResponse } from '../../core/passwordchallenge';

function nodeMd5Hex(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
}

describe('passwordchallenge', () => {
    test('md5Encode matches Node\'s crypto module', () => {
        let encoded = md5Encode('correcthorsebatterystaple');
        let hex = Array.from(encoded).map((b) => b.toString(16).padStart(2, '0')).join('');

        expect(hex).toBe(nodeMd5Hex('correcthorsebatterystaple'));
    });

    test('createResponse falls back to the plain MD5 hash when no challenge is issued', () => {
        let md5Password = md5Encode('hunter2');

        expect(createResponse('', md5Password)).toBe(nodeMd5Hex('hunter2'));
    });

    test('createResponse computes the HMAC-MD5-style challenge response', () => {
        // Hand-computed per com.fumbbl.ffb.PasswordChallenge's algorithm:
        // R = MD5(MD5(password) XOR 0x5c... + MD5((MD5(password) XOR 0x36...) + challenge))
        let password = 'hunter2';
        let challengeHex = '45b0f59c6da82c2dddf251b9c52bbf21';

        let md5Password = Buffer.from(nodeMd5Hex(password), 'hex');
        let challenge = Buffer.from(challengeHex, 'hex');
        let opad = Buffer.from(md5Password.map((b) => b ^ 0x5c));
        let ipad = Buffer.from(md5Password.map((b) => b ^ 0x36));
        let inner = crypto.createHash('md5').update(Buffer.concat([ipad, challenge])).digest();
        let expected = crypto.createHash('md5').update(Buffer.concat([opad, inner])).digest('hex');

        expect(createChallengeResponse(password, challengeHex)).toBe(expected);
    });
});
