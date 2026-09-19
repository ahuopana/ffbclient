import { md5 } from "js-md5";

/**
 * Client side of the clientPasswordChallenge/serverPasswordChallenge handshake
 * (com.fumbbl.ffb.PasswordChallenge on the server): HMAC-MD5-style response so
 * the raw password never goes over the wire.
 */

export function md5Encode(message: string | Uint8Array): Uint8Array {
    return new Uint8Array(md5.arrayBuffer(message));
}

export function fromHexString(hexString: string): Uint8Array {
    let bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes;
}

export function toHexString(bytes: Uint8Array): string {
    let hexString = "";
    for (let i = 0; i < bytes.length; i++) {
        hexString += bytes[i].toString(16).padStart(2, "0");
    }
    return hexString;
}

export function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
    let result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
}

export function xor(bytes: Uint8Array, mask: number): Uint8Array {
    let result = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        result[i] = bytes[i] ^ mask;
    }
    return result;
}

export function createResponse(challenge: string, md5EncodedPassword: Uint8Array): string {
    if (challenge) {
        let challengeBytes = fromHexString(challenge);
        let opad = xor(md5EncodedPassword, 0x5c);
        let ipad = xor(md5EncodedPassword, 0x36);
        return toHexString(md5Encode(concat(opad, md5Encode(concat(ipad, challengeBytes)))));
    } else {
        return toHexString(md5EncodedPassword);
    }
}

export function createChallengeResponse(password: string, challenge: string): string {
    return createResponse(challenge, md5Encode(password));
}
