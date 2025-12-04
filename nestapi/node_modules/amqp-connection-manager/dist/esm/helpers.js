export function wait(timeInMs) {
    let timeoutHandle;
    return {
        promise: new Promise(function (resolve) {
            timeoutHandle = setTimeout(resolve, timeInMs);
        }),
        cancel: () => clearTimeout(timeoutHandle),
    };
}
//# sourceMappingURL=helpers.js.map