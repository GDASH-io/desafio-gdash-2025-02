"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenParserError = exports.TokenParserMode = void 0;
const constants_1 = require("./utils/constants");
const { LEFT_BRACE, RIGHT_BRACE, LEFT_BRACKET, RIGHT_BRACKET, COLON, COMMA, TRUE, FALSE, NULL, STRING, NUMBER, SEPARATOR, } = constants_1.TokenType;
// Parser States
var TokenParserState;
(function (TokenParserState) {
    TokenParserState[TokenParserState["VALUE"] = 0] = "VALUE";
    TokenParserState[TokenParserState["KEY"] = 1] = "KEY";
    TokenParserState[TokenParserState["COLON"] = 2] = "COLON";
    TokenParserState[TokenParserState["COMMA"] = 3] = "COMMA";
    TokenParserState[TokenParserState["ENDED"] = 4] = "ENDED";
    TokenParserState[TokenParserState["ERROR"] = 5] = "ERROR";
    TokenParserState[TokenParserState["SEPARATOR"] = 6] = "SEPARATOR";
})(TokenParserState || (TokenParserState = {}));
// Parser Modes
var TokenParserMode;
(function (TokenParserMode) {
    TokenParserMode[TokenParserMode["OBJECT"] = 0] = "OBJECT";
    TokenParserMode[TokenParserMode["ARRAY"] = 1] = "ARRAY";
})(TokenParserMode = exports.TokenParserMode || (exports.TokenParserMode = {}));
const defaultOpts = {
    paths: undefined,
    keepStack: true,
    separator: undefined,
};
class TokenParserError extends Error {
    constructor(message) {
        super(message);
        // Typescript is broken. This is a workaround
        Object.setPrototypeOf(this, TokenParserError.prototype);
    }
}
exports.TokenParserError = TokenParserError;
class TokenParser {
    constructor(opts) {
        this.state = TokenParserState.VALUE;
        this.mode = undefined;
        this.key = undefined;
        this.value = undefined;
        this.stack = [];
        opts = Object.assign(Object.assign({}, defaultOpts), opts);
        if (opts.paths) {
            this.paths = opts.paths.map((path) => {
                if (path === undefined || path === "$*")
                    return undefined;
                if (!path.startsWith("$"))
                    throw new TokenParserError(`Invalid selector "${path}". Should start with "$".`);
                const pathParts = path.split(".").slice(1);
                if (pathParts.includes(""))
                    throw new TokenParserError(`Invalid selector "${path}". ".." syntax not supported.`);
                return pathParts;
            });
        }
        this.keepStack = opts.keepStack;
        this.separator = opts.separator;
    }
    shouldEmit() {
        if (!this.paths)
            return true;
        return this.paths.some((path) => {
            var _a;
            if (path === undefined)
                return true;
            if (path.length !== this.stack.length)
                return false;
            for (let i = 0; i < path.length - 1; i++) {
                const selector = path[i];
                const key = this.stack[i + 1].key;
                if (selector === "*")
                    continue;
                if (selector !== key)
                    return false;
            }
            const selector = path[path.length - 1];
            if (selector === "*")
                return true;
            return selector === ((_a = this.key) === null || _a === void 0 ? void 0 : _a.toString());
        });
    }
    push() {
        this.stack.push({
            key: this.key,
            value: this.value,
            mode: this.mode,
            emit: this.shouldEmit(),
        });
    }
    pop() {
        const value = this.value;
        let emit;
        ({
            key: this.key,
            value: this.value,
            mode: this.mode,
            emit,
        } = this.stack.pop());
        this.state =
            this.mode !== undefined ? TokenParserState.COMMA : TokenParserState.VALUE;
        this.emit(value, emit);
    }
    emit(value, emit) {
        if (!this.keepStack &&
            this.value &&
            this.stack.every((item) => !item.emit)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete this.value[this.key];
        }
        if (emit) {
            this.onValue(value, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.key, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.value, this.stack);
        }
        if (this.stack.length === 0) {
            if (this.separator) {
                this.state = TokenParserState.SEPARATOR;
            }
            else if (this.separator === undefined) {
                this.end();
            }
            // else if separator === '', expect next JSON object.
        }
    }
    get isEnded() {
        return this.state === TokenParserState.ENDED;
    }
    write(token, value) {
        if (this.state === TokenParserState.VALUE) {
            if (token === STRING ||
                token === NUMBER ||
                token === TRUE ||
                token === FALSE ||
                token === NULL) {
                if (this.mode === TokenParserMode.OBJECT) {
                    this.value[this.key] = value;
                    this.state = TokenParserState.COMMA;
                }
                else if (this.mode === TokenParserMode.ARRAY) {
                    this.value.push(value);
                    this.state = TokenParserState.COMMA;
                }
                this.emit(value, this.shouldEmit());
                return;
            }
            if (token === LEFT_BRACE) {
                this.push();
                if (this.mode === TokenParserMode.OBJECT) {
                    this.value = this.value[this.key] = {};
                }
                else if (this.mode === TokenParserMode.ARRAY) {
                    const val = {};
                    this.value.push(val);
                    this.value = val;
                }
                else {
                    this.value = {};
                }
                this.mode = TokenParserMode.OBJECT;
                this.state = TokenParserState.KEY;
                this.key = undefined;
                return;
            }
            if (token === LEFT_BRACKET) {
                this.push();
                if (this.mode === TokenParserMode.OBJECT) {
                    this.value = this.value[this.key] = [];
                }
                else if (this.mode === TokenParserMode.ARRAY) {
                    const val = [];
                    this.value.push(val);
                    this.value = val;
                }
                else {
                    this.value = [];
                }
                this.mode = TokenParserMode.ARRAY;
                this.state = TokenParserState.VALUE;
                this.key = 0;
                return;
            }
            if (this.mode === TokenParserMode.ARRAY &&
                token === RIGHT_BRACKET &&
                this.value.length === 0) {
                this.pop();
                return;
            }
        }
        if (this.state === TokenParserState.KEY) {
            if (token === STRING) {
                this.key = value;
                this.state = TokenParserState.COLON;
                return;
            }
            if (token === RIGHT_BRACE &&
                Object.keys(this.value).length === 0) {
                this.pop();
                return;
            }
        }
        if (this.state === TokenParserState.COLON) {
            if (token === COLON) {
                this.state = TokenParserState.VALUE;
                return;
            }
        }
        if (this.state === TokenParserState.COMMA) {
            if (token === COMMA) {
                if (this.mode === TokenParserMode.ARRAY) {
                    this.state = TokenParserState.VALUE;
                    this.key += 1;
                    return;
                }
                /* istanbul ignore else */
                if (this.mode === TokenParserMode.OBJECT) {
                    this.state = TokenParserState.KEY;
                    return;
                }
            }
            if ((token === RIGHT_BRACE && this.mode === TokenParserMode.OBJECT) ||
                (token === RIGHT_BRACKET && this.mode === TokenParserMode.ARRAY)) {
                this.pop();
                return;
            }
        }
        if (this.state === TokenParserState.SEPARATOR) {
            if (token === SEPARATOR && value === this.separator) {
                this.state = TokenParserState.VALUE;
                return;
            }
        }
        this.error(new TokenParserError(`Unexpected ${constants_1.TokenType[token]} (${JSON.stringify(value)}) in state ${TokenParserState[this.state]}`));
    }
    error(err) {
        if (this.state !== TokenParserState.ENDED) {
            this.state = TokenParserState.ERROR;
        }
        this.onError(err);
    }
    end() {
        if ((this.state !== TokenParserState.VALUE &&
            this.state !== TokenParserState.SEPARATOR) ||
            this.stack.length > 0) {
            this.error(new Error(`Parser ended in mid-parsing (state: ${TokenParserState[this.state]}). Either not all the data was received or the data was invalid.`));
        }
        else {
            this.state = TokenParserState.ENDED;
            this.onEnd();
        }
    }
    onValue(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    value, key, parent, stack
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ) {
        // Override me
        throw new TokenParserError('Can\'t emit data before the "onValue" callback has been set up.');
    }
    onError(err) {
        // Override me
        throw err;
    }
    onEnd() {
        // Override me
    }
}
exports.default = TokenParser;
