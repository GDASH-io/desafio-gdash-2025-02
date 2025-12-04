export declare function wait(timeInMs: number): {
    promise: Promise<void>;
    cancel: () => void;
};
