"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmqpConnectionManagerClass = void 0;
exports.connect = connect;
/* eslint-disable @typescript-eslint/no-namespace */
const AmqpConnectionManager_js_1 = __importDefault(require("./AmqpConnectionManager.js"));
exports.AmqpConnectionManagerClass = AmqpConnectionManager_js_1.default;
function connect(urls, options) {
    const conn = new AmqpConnectionManager_js_1.default(urls, options);
    conn.connect().catch(() => {
        /* noop */
    });
    return conn;
}
const amqp = { connect };
exports.default = amqp;
