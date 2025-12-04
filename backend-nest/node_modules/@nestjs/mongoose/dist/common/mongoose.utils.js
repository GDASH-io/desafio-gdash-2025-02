"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelToken = getModelToken;
exports.getConnectionToken = getConnectionToken;
exports.handleRetry = handleRetry;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const mongoose_constants_1 = require("../mongoose.constants");
function getModelToken(model, connectionName) {
    if (connectionName === undefined) {
        return `${model}Model`;
    }
    return `${getConnectionToken(connectionName)}/${model}Model`;
}
function getConnectionToken(name) {
    return name && name !== mongoose_constants_1.DEFAULT_DB_CONNECTION
        ? `${name}Connection`
        : mongoose_constants_1.DEFAULT_DB_CONNECTION;
}
function handleRetry(retryAttempts = 9, retryDelay = 3000, verboseRetryLog = false) {
    const logger = new common_1.Logger('MongooseModule');
    return (source) => source.pipe((0, operators_1.retryWhen)((e) => e.pipe((0, operators_1.scan)((errorCount, error) => {
        const verboseMessage = verboseRetryLog
            ? ` Message: ${error.message}.`
            : "";
        const retryMessage = retryAttempts > 0
            ? ` Retrying (${errorCount + 1})...`
            : "";
        logger.error([
            "Unable to connect to the database.",
            verboseMessage,
            retryMessage,
        ].join(""), error.stack);
        if (errorCount + 1 >= retryAttempts) {
            throw error;
        }
        return errorCount + 1;
    }, 0), (0, operators_1.delay)(retryDelay))));
}
