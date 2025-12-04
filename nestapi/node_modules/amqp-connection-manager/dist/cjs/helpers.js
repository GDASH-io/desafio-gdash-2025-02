"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = wait;
function wait(timeInMs) {
    let timeoutHandle;
    return {
        promise: new Promise(function (resolve) {
            timeoutHandle = setTimeout(resolve, timeInMs);
        }),
        cancel: () => clearTimeout(timeoutHandle),
    };
}
