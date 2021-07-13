const config = require("./jest.config");

// Override default configuration
config.testMatch = ["**/tests/unit/**/*.[jt]s?(x)"];

// eslint-disable-next-line no-console
console.log("RUNNING UNIT TESTS");

module.exports = config;
