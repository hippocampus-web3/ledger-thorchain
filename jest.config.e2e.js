const config = require("./jest.config");

// Override default configuration
config.testMatch = ["**/tests/e2e/**/*.[jt]s?(x)"];

// eslint-disable-next-line no-console
console.log("RUNNING INTEGRATION TESTS");

module.exports = config;
