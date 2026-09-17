module.exports = {
    "testEnvironment": "jsdom",
    "setupFiles": ["jest-canvas-mock"],
    "moduleNameMapper": {
        "^phaser$": "<rootDir>/node_modules/phaser/dist/phaser.js"
    },
    "transform": {
        "^.+\\.tsx?$": ["ts-jest", {
            tsconfig: {
                module: "commonjs",
                moduleResolution: "node"
            }
        }]
    },
    "testRegex": "/tests/.*\\.test\\.tsx?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ]
};
