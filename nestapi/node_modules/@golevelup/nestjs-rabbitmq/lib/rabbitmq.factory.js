"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitRpcParamsFactory = void 0;
const lodash_1 = require("lodash");
const rabbitmq_constants_1 = require("./rabbitmq.constants");
class RabbitRpcParamsFactory {
    exchangeKeyForValue(type, data, args) {
        var _a;
        if (!args) {
            return null;
        }
        let index = 0;
        if (type === rabbitmq_constants_1.RABBIT_PARAM_TYPE) {
            index = 0;
        }
        else if (type === rabbitmq_constants_1.RABBIT_REQUEST_TYPE) {
            index = 1;
        }
        else if (type === rabbitmq_constants_1.RABBIT_HEADER_TYPE) {
            index = 2;
        }
        return data && !(0, lodash_1.isObject)(data) ? (_a = args[index]) === null || _a === void 0 ? void 0 : _a[data] : args[index];
    }
}
exports.RabbitRpcParamsFactory = RabbitRpcParamsFactory;
//# sourceMappingURL=rabbitmq.factory.js.map