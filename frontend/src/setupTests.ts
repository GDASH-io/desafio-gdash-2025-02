import '@testing-library/jest-dom';

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.ResizeObserver = ResizeObserver;
}

if (!HTMLElement.prototype.scrollIntoView) {
    // eslint-disable-next-line no-extend-native
    HTMLElement.prototype.scrollIntoView = () => {};
}
