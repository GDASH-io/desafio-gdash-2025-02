"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRabbitContext = void 0;
const rabbitmq_constants_1 = require("./rabbitmq.constants");
const isRabbitContext = (executionContext) => {
    const handler = executionContext.getHandler();
    return Reflect.getMetadataKeys(handler).includes(rabbitmq_constants_1.RABBIT_HANDLER);
};
exports.isRabbitContext = isRabbitContext;
//# sourceMappingURL=rabbitmq.helpers.js.map