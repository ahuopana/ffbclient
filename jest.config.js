module.exports = {
    "testEnvironment": "jsdom",
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
