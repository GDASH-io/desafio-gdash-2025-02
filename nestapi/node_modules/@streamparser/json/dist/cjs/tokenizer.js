"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenizerError = void 0;
const utf_8_1 = require("./utils/utf-8");
const bufferedString_1 = require("./utils/bufferedString");
const constants_1 = require("./utils/constants");
const { LEFT_BRACE, RIGHT_BRACE, LEFT_BRACKET, RIGHT_BRACKET, COLON, COMMA, TRUE, FALSE, NULL, STRING, NUMBER, } = constants_1.TokenType;
// Tokenizer States
var TokenizerStates;
(function (TokenizerStates) {
    TokenizerStates[TokenizerStates["START"] = 0] = "START";
    TokenizerStates[TokenizerStates["ENDED"] = 1] = "ENDED";
    TokenizerStates[TokenizerStates["ERROR"] = 2] = "ERROR";
    TokenizerStates[TokenizerStates["TRUE1"] = 3] = "TRUE1";
    TokenizerStates[TokenizerStates["TRUE2"] = 4] = "TRUE2";
    TokenizerStates[TokenizerStates["TRUE3"] = 5] = "TRUE3";
    TokenizerStates[TokenizerStates["FALSE1"] = 6] = "FALSE1";
    TokenizerStates[TokenizerStates["FALSE2"] = 7] = "FALSE2";
    TokenizerStates[TokenizerStates["FALSE3"] = 8] = "FALSE3";
    TokenizerStates[TokenizerStates["FALSE4"] = 9] = "FALSE4";
    TokenizerStates[TokenizerStates["NULL1"] = 10] = "NULL1";
    TokenizerStates[TokenizerStates["NULL2"] = 11] = "NULL2";
    TokenizerStates[TokenizerStates["NULL3"] = 12] = "NULL3";
    TokenizerStates[TokenizerStates["STRING_DEFAULT"] = 13] = "STRING_DEFAULT";
    TokenizerStates[TokenizerStates["STRING_AFTER_BACKSLASH"] = 14] = "STRING_AFTER_BACKSLASH";
    TokenizerStates[TokenizerStates["STRING_UNICODE_DIGIT_1"] = 15] = "STRING_UNICODE_DIGIT_1";
    TokenizerStates[TokenizerStates["STRING_UNICODE_DIGIT_2"] = 16] = "STRING_UNICODE_DIGIT_2";
    TokenizerStates[TokenizerStates["STRING_UNICODE_DIGIT_3"] = 17] = "STRING_UNICODE_DIGIT_3";
    TokenizerStates[TokenizerStates["STRING_UNICODE_DIGIT_4"] = 18] = "STRING_UNICODE_DIGIT_4";
    TokenizerStates[TokenizerStates["STRING_INCOMPLETE_CHAR"] = 19] = "STRING_INCOMPLETE_CHAR";
    TokenizerStates[TokenizerStates["NUMBER_AFTER_INITIAL_MINUS"] = 20] = "NUMBER_AFTER_INITIAL_MINUS";
    TokenizerStates[TokenizerStates["NUMBER_AFTER_INITIAL_ZERO"] = 21] = "NUMBER_AFTER_INITIAL_ZERO";
    TokenizerStates[TokenizerStates["NUMBER_AFTER_INITIAL_NON_ZERO"] = 22] = "NUMBER_AFTER_INITIAL_NON_ZERO";
    TokenizerStates[TokenizerStates["NUMBER_AFTER_FULL_STOP"] = 23] = "NUMBER_AFTER_FULL_STOP";
    TokenizerStates[TokenizerStates["NUMBER_AFTER_DECIMAL"] = 24] = "NUMBER_AFTER_DECIMAL";
    TokenizerStates[TokenizerStates["NUMBER_AFTER_E"] = 25] = "NUMBER_AFTER_E";
    TokenizerStates[TokenizerStates["NUMBER_AFTER_E_AND_SIGN"] = 26] = "NUMBER_AFTER_E_AND_SIGN";
    TokenizerStates[TokenizerStates["NUMBER_AFTER_E_AND_DIGIT"] = 27] = "NUMBER_AFTER_E_AND_DIGIT";
    TokenizerStates[TokenizerStates["SEPARATOR"] = 28] = "SEPARATOR";
})(TokenizerStates || (TokenizerStates = {}));
const defaultOpts = {
    stringBufferSize: 0,
    numberBufferSize: 0,
    separator: undefined,
};
class TokenizerError extends Error {
    constructor(message) {
        super(message);
        // Typescript is broken. This is a workaround
        Object.setPrototypeOf(this, TokenizerError.prototype);
    }
}
exports.TokenizerError = TokenizerError;
class Tokenizer {
    constructor(opts) {
        this.state = TokenizerStates.START;
        this.separatorIndex = 0;
        this.unicode = undefined; // unicode escapes
        this.highSurrogate = undefined;
        this.bytes_remaining = 0; // number of bytes remaining in multi byte utf8 char to read after split boundary
        this.bytes_in_sequence = 0; // bytes in multi byte utf8 char to read
        this.char_split_buffer = new Uint8Array(4); // for rebuilding chars split before boundary is reached
        this.encoder = new TextEncoder();
        this.offset = -1;
        opts = Object.assign(Object.assign({}, defaultOpts), opts);
        this.bufferedString =
            opts.stringBufferSize && opts.stringBufferSize > 4
                ? new bufferedString_1.BufferedString(opts.stringBufferSize)
                : new bufferedString_1.NonBufferedString();
        this.bufferedNumber =
            opts.numberBufferSize && opts.numberBufferSize > 0
                ? new bufferedString_1.BufferedString(opts.numberBufferSize)
                : new bufferedString_1.NonBufferedString();
        this.separator = opts.separator;
        this.separatorBytes = opts.separator
            ? this.encoder.encode(opts.separator)
            : undefined;
    }
    get isEnded() {
        return this.state === TokenizerStates.ENDED;
    }
    write(input) {
        let buffer;
        if (input instanceof Uint8Array) {
            buffer = input;
        }
        else if (typeof input === "string") {
            buffer = this.encoder.encode(input);
        }
        else if ((typeof input === "object" && "buffer" in input) ||
            Array.isArray(input)) {
            buffer = Uint8Array.from(input);
        }
        else {
            this.error(new TypeError("Unexpected type. The `write` function only accepts Arrays, TypedArrays and Strings."));
            return;
        }
        for (let i = 0; i < buffer.length; i += 1) {
            const n = buffer[i]; // get current byte from buffer
            switch (this.state) {
                case TokenizerStates.START:
                    this.offset += 1;
                    if (this.separatorBytes && n === this.separatorBytes[0]) {
                        if (this.separatorBytes.length === 1) {
                            this.state = TokenizerStates.START;
                            this.onToken(constants_1.TokenType.SEPARATOR, this.separator, this.offset + this.separatorBytes.length - 1);
                            continue;
                        }
                        this.state = TokenizerStates.SEPARATOR;
                        continue;
                    }
                    if (n === utf_8_1.charset.SPACE ||
                        n === utf_8_1.charset.NEWLINE ||
                        n === utf_8_1.charset.CARRIAGE_RETURN ||
                        n === utf_8_1.charset.TAB) {
                        // whitespace
                        continue;
                    }
                    if (n === utf_8_1.charset.LEFT_CURLY_BRACKET) {
                        this.onToken(LEFT_BRACE, "{", this.offset);
                        continue;
                    }
                    if (n === utf_8_1.charset.RIGHT_CURLY_BRACKET) {
                        this.onToken(RIGHT_BRACE, "}", this.offset);
                        continue;
                    }
                    if (n === utf_8_1.charset.LEFT_SQUARE_BRACKET) {
                        this.onToken(LEFT_BRACKET, "[", this.offset);
                        continue;
                    }
                    if (n === utf_8_1.charset.RIGHT_SQUARE_BRACKET) {
                        this.onToken(RIGHT_BRACKET, "]", this.offset);
                        continue;
                    }
                    if (n === utf_8_1.charset.COLON) {
                        this.onToken(COLON, ":", this.offset);
                        continue;
                    }
                    if (n === utf_8_1.charset.COMMA) {
                        this.onToken(COMMA, ",", this.offset);
                        continue;
                    }
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_T) {
                        this.state = TokenizerStates.TRUE1;
                        continue;
                    }
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_F) {
                        this.state = TokenizerStates.FALSE1;
                        continue;
                    }
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_N) {
                        this.state = TokenizerStates.NULL1;
                        continue;
                    }
                    if (n === utf_8_1.charset.QUOTATION_MARK) {
                        this.bufferedString.reset();
                        this.state = TokenizerStates.STRING_DEFAULT;
                        continue;
                    }
                    if (n >= utf_8_1.charset.DIGIT_ONE && n <= utf_8_1.charset.DIGIT_NINE) {
                        this.bufferedNumber.reset();
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_INITIAL_NON_ZERO;
                        continue;
                    }
                    if (n === utf_8_1.charset.DIGIT_ZERO) {
                        this.bufferedNumber.reset();
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_INITIAL_ZERO;
                        continue;
                    }
                    if (n === utf_8_1.charset.HYPHEN_MINUS) {
                        this.bufferedNumber.reset();
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_INITIAL_MINUS;
                        continue;
                    }
                    break;
                // STRING
                case TokenizerStates.STRING_DEFAULT:
                    if (n === utf_8_1.charset.QUOTATION_MARK) {
                        const string = this.bufferedString.toString();
                        this.state = TokenizerStates.START;
                        this.onToken(STRING, string, this.offset);
                        this.offset += this.bufferedString.byteLength + 1;
                        continue;
                    }
                    if (n === utf_8_1.charset.REVERSE_SOLIDUS) {
                        this.state = TokenizerStates.STRING_AFTER_BACKSLASH;
                        continue;
                    }
                    if (n >= 128) {
                        // Parse multi byte (>=128) chars one at a time
                        if (n >= 194 && n <= 223) {
                            this.bytes_in_sequence = 2;
                        }
                        else if (n <= 239) {
                            this.bytes_in_sequence = 3;
                        }
                        else {
                            this.bytes_in_sequence = 4;
                        }
                        if (this.bytes_in_sequence <= buffer.length - i) {
                            // if bytes needed to complete char fall outside buffer length, we have a boundary split
                            this.bufferedString.appendBuf(buffer, i, i + this.bytes_in_sequence);
                            i += this.bytes_in_sequence - 1;
                            continue;
                        }
                        this.bytes_remaining = i + this.bytes_in_sequence - buffer.length;
                        this.char_split_buffer.set(buffer.subarray(i));
                        i = buffer.length - 1;
                        this.state = TokenizerStates.STRING_INCOMPLETE_CHAR;
                        continue;
                    }
                    if (n >= utf_8_1.charset.SPACE) {
                        this.bufferedString.appendChar(n);
                        continue;
                    }
                    break;
                case TokenizerStates.STRING_INCOMPLETE_CHAR:
                    // check for carry over of a multi byte char split between data chunks
                    // & fill temp buffer it with start of this data chunk up to the boundary limit set in the last iteration
                    this.char_split_buffer.set(buffer.subarray(i, i + this.bytes_remaining), this.bytes_in_sequence - this.bytes_remaining);
                    this.bufferedString.appendBuf(this.char_split_buffer, 0, this.bytes_in_sequence);
                    i = this.bytes_remaining - 1;
                    this.state = TokenizerStates.STRING_DEFAULT;
                    continue;
                case TokenizerStates.STRING_AFTER_BACKSLASH:
                    const controlChar = utf_8_1.escapedSequences[n];
                    if (controlChar) {
                        this.bufferedString.appendChar(controlChar);
                        this.state = TokenizerStates.STRING_DEFAULT;
                        continue;
                    }
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_U) {
                        this.unicode = "";
                        this.state = TokenizerStates.STRING_UNICODE_DIGIT_1;
                        continue;
                    }
                    break;
                case TokenizerStates.STRING_UNICODE_DIGIT_1:
                case TokenizerStates.STRING_UNICODE_DIGIT_2:
                case TokenizerStates.STRING_UNICODE_DIGIT_3:
                    if ((n >= utf_8_1.charset.DIGIT_ZERO && n <= utf_8_1.charset.DIGIT_NINE) ||
                        (n >= utf_8_1.charset.LATIN_CAPITAL_LETTER_A &&
                            n <= utf_8_1.charset.LATIN_CAPITAL_LETTER_F) ||
                        (n >= utf_8_1.charset.LATIN_SMALL_LETTER_A &&
                            n <= utf_8_1.charset.LATIN_SMALL_LETTER_F)) {
                        this.unicode += String.fromCharCode(n);
                        this.state += 1;
                        continue;
                    }
                    break;
                case TokenizerStates.STRING_UNICODE_DIGIT_4:
                    if ((n >= utf_8_1.charset.DIGIT_ZERO && n <= utf_8_1.charset.DIGIT_NINE) ||
                        (n >= utf_8_1.charset.LATIN_CAPITAL_LETTER_A &&
                            n <= utf_8_1.charset.LATIN_CAPITAL_LETTER_F) ||
                        (n >= utf_8_1.charset.LATIN_SMALL_LETTER_A &&
                            n <= utf_8_1.charset.LATIN_SMALL_LETTER_F)) {
                        const intVal = parseInt(this.unicode + String.fromCharCode(n), 16);
                        if (this.highSurrogate === undefined) {
                            if (intVal >= 0xd800 && intVal <= 0xdbff) {
                                //<55296,56319> - highSurrogate
                                this.highSurrogate = intVal;
                            }
                            else {
                                this.bufferedString.appendBuf(this.encoder.encode(String.fromCharCode(intVal)));
                            }
                        }
                        else {
                            if (intVal >= 0xdc00 && intVal <= 0xdfff) {
                                //<56320,57343> - lowSurrogate
                                this.bufferedString.appendBuf(this.encoder.encode(String.fromCharCode(this.highSurrogate, intVal)));
                            }
                            else {
                                this.bufferedString.appendBuf(this.encoder.encode(String.fromCharCode(this.highSurrogate)));
                            }
                            this.highSurrogate = undefined;
                        }
                        this.state = TokenizerStates.STRING_DEFAULT;
                        continue;
                    }
                // Number
                case TokenizerStates.NUMBER_AFTER_INITIAL_MINUS:
                    if (n === utf_8_1.charset.DIGIT_ZERO) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_INITIAL_ZERO;
                        continue;
                    }
                    if (n >= utf_8_1.charset.DIGIT_ONE && n <= utf_8_1.charset.DIGIT_NINE) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_INITIAL_NON_ZERO;
                        continue;
                    }
                    break;
                case TokenizerStates.NUMBER_AFTER_INITIAL_ZERO:
                    if (n === utf_8_1.charset.FULL_STOP) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_FULL_STOP;
                        continue;
                    }
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_E ||
                        n === utf_8_1.charset.LATIN_CAPITAL_LETTER_E) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_E;
                        continue;
                    }
                    i -= 1;
                    this.state = TokenizerStates.START;
                    this.emitNumber();
                    continue;
                case TokenizerStates.NUMBER_AFTER_INITIAL_NON_ZERO:
                    if (n >= utf_8_1.charset.DIGIT_ZERO && n <= utf_8_1.charset.DIGIT_NINE) {
                        this.bufferedNumber.appendChar(n);
                        continue;
                    }
                    if (n === utf_8_1.charset.FULL_STOP) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_FULL_STOP;
                        continue;
                    }
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_E ||
                        n === utf_8_1.charset.LATIN_CAPITAL_LETTER_E) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_E;
                        continue;
                    }
                    i -= 1;
                    this.state = TokenizerStates.START;
                    this.emitNumber();
                    continue;
                case TokenizerStates.NUMBER_AFTER_FULL_STOP:
                    if (n >= utf_8_1.charset.DIGIT_ZERO && n <= utf_8_1.charset.DIGIT_NINE) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_DECIMAL;
                        continue;
                    }
                    break;
                case TokenizerStates.NUMBER_AFTER_DECIMAL:
                    if (n >= utf_8_1.charset.DIGIT_ZERO && n <= utf_8_1.charset.DIGIT_NINE) {
                        this.bufferedNumber.appendChar(n);
                        continue;
                    }
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_E ||
                        n === utf_8_1.charset.LATIN_CAPITAL_LETTER_E) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_E;
                        continue;
                    }
                    i -= 1;
                    this.state = TokenizerStates.START;
                    this.emitNumber();
                    continue;
                case TokenizerStates.NUMBER_AFTER_E:
                    if (n === utf_8_1.charset.PLUS_SIGN || n === utf_8_1.charset.HYPHEN_MINUS) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_E_AND_SIGN;
                        continue;
                    }
                // Allow cascading
                case TokenizerStates.NUMBER_AFTER_E_AND_SIGN:
                    if (n >= utf_8_1.charset.DIGIT_ZERO && n <= utf_8_1.charset.DIGIT_NINE) {
                        this.bufferedNumber.appendChar(n);
                        this.state = TokenizerStates.NUMBER_AFTER_E_AND_DIGIT;
                        continue;
                    }
                    break;
                case TokenizerStates.NUMBER_AFTER_E_AND_DIGIT:
                    if (n >= utf_8_1.charset.DIGIT_ZERO && n <= utf_8_1.charset.DIGIT_NINE) {
                        this.bufferedNumber.appendChar(n);
                        continue;
                    }
                    i -= 1;
                    this.state = TokenizerStates.START;
                    this.emitNumber();
                    continue;
                // TRUE
                case TokenizerStates.TRUE1:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_R) {
                        this.state = TokenizerStates.TRUE2;
                        continue;
                    }
                    break;
                case TokenizerStates.TRUE2:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_U) {
                        this.state = TokenizerStates.TRUE3;
                        continue;
                    }
                    break;
                case TokenizerStates.TRUE3:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_E) {
                        this.state = TokenizerStates.START;
                        this.onToken(TRUE, true, this.offset);
                        this.offset += 3;
                        continue;
                    }
                    break;
                // FALSE
                case TokenizerStates.FALSE1:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_A) {
                        this.state = TokenizerStates.FALSE2;
                        continue;
                    }
                    break;
                case TokenizerStates.FALSE2:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_L) {
                        this.state = TokenizerStates.FALSE3;
                        continue;
                    }
                    break;
                case TokenizerStates.FALSE3:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_S) {
                        this.state = TokenizerStates.FALSE4;
                        continue;
                    }
                    break;
                case TokenizerStates.FALSE4:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_E) {
                        this.state = TokenizerStates.START;
                        this.onToken(FALSE, false, this.offset);
                        this.offset += 4;
                        continue;
                    }
                    break;
                // NULL
                case TokenizerStates.NULL1:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_U) {
                        this.state = TokenizerStates.NULL2;
                        continue;
                    }
                    break;
                case TokenizerStates.NULL2:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_L) {
                        this.state = TokenizerStates.NULL3;
                        continue;
                    }
                    break;
                case TokenizerStates.NULL3:
                    if (n === utf_8_1.charset.LATIN_SMALL_LETTER_L) {
                        this.state = TokenizerStates.START;
                        this.onToken(NULL, null, this.offset);
                        this.offset += 3;
                        continue;
                    }
                    break;
                case TokenizerStates.SEPARATOR:
                    this.separatorIndex += 1;
                    if (!this.separatorBytes ||
                        n !== this.separatorBytes[this.separatorIndex]) {
                        break;
                    }
                    if (this.separatorIndex === this.separatorBytes.length - 1) {
                        this.state = TokenizerStates.START;
                        this.onToken(constants_1.TokenType.SEPARATOR, this.separator, this.offset + this.separatorIndex);
                        this.separatorIndex = 0;
                    }
                    continue;
                case TokenizerStates.ENDED:
                    if (n === utf_8_1.charset.SPACE ||
                        n === utf_8_1.charset.NEWLINE ||
                        n === utf_8_1.charset.CARRIAGE_RETURN ||
                        n === utf_8_1.charset.TAB) {
                        // whitespace
                        continue;
                    }
            }
            this.error(new TokenizerError(`Unexpected "${String.fromCharCode(n)}" at position "${i}" in state ${TokenizerStates[this.state]}`));
            return;
        }
    }
    emitNumber() {
        this.onToken(NUMBER, this.parseNumber(this.bufferedNumber.toString()), this.offset);
        this.offset += this.bufferedNumber.byteLength - 1;
    }
    parseNumber(numberStr) {
        return Number(numberStr);
    }
    error(err) {
        if (this.state !== TokenizerStates.ENDED) {
            this.state = TokenizerStates.ERROR;
        }
        this.onError(err);
    }
    end() {
        switch (this.state) {
            case TokenizerStates.NUMBER_AFTER_INITIAL_ZERO:
            case TokenizerStates.NUMBER_AFTER_INITIAL_NON_ZERO:
            case TokenizerStates.NUMBER_AFTER_DECIMAL:
            case TokenizerStates.NUMBER_AFTER_E_AND_DIGIT:
                this.state = TokenizerStates.ENDED;
                this.emitNumber();
                this.onEnd();
                break;
            case TokenizerStates.START:
            case TokenizerStates.ERROR:
            case TokenizerStates.SEPARATOR:
                this.state = TokenizerStates.ENDED;
                this.onEnd();
                break;
            default:
                this.error(new TokenizerError(`Tokenizer ended in the middle of a token (state: ${TokenizerStates[this.state]}). Either not all the data was received or the data was invalid.`));
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onToken(token, value, offset) {
        // Override me
        throw new TokenizerError('Can\'t emit tokens before the "onToken" callback has been set up.');
    }
    onError(err) {
        // Override me
        throw err;
    }
    onEnd() {
        // Override me
    }
}
exports.default = Tokenizer;
