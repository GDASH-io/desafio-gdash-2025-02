(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.jsonparse = {}));
})(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var _a;
    var charset;
    (function (charset) {
        charset[charset["BACKSPACE"] = 8] = "BACKSPACE";
        charset[charset["FORM_FEED"] = 12] = "FORM_FEED";
        charset[charset["NEWLINE"] = 10] = "NEWLINE";
        charset[charset["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
        charset[charset["TAB"] = 9] = "TAB";
        charset[charset["SPACE"] = 32] = "SPACE";
        charset[charset["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
        charset[charset["QUOTATION_MARK"] = 34] = "QUOTATION_MARK";
        charset[charset["NUMBER_SIGN"] = 35] = "NUMBER_SIGN";
        charset[charset["DOLLAR_SIGN"] = 36] = "DOLLAR_SIGN";
        charset[charset["PERCENT_SIGN"] = 37] = "PERCENT_SIGN";
        charset[charset["AMPERSAND"] = 38] = "AMPERSAND";
        charset[charset["APOSTROPHE"] = 39] = "APOSTROPHE";
        charset[charset["LEFT_PARENTHESIS"] = 40] = "LEFT_PARENTHESIS";
        charset[charset["RIGHT_PARENTHESIS"] = 41] = "RIGHT_PARENTHESIS";
        charset[charset["ASTERISK"] = 42] = "ASTERISK";
        charset[charset["PLUS_SIGN"] = 43] = "PLUS_SIGN";
        charset[charset["COMMA"] = 44] = "COMMA";
        charset[charset["HYPHEN_MINUS"] = 45] = "HYPHEN_MINUS";
        charset[charset["FULL_STOP"] = 46] = "FULL_STOP";
        charset[charset["SOLIDUS"] = 47] = "SOLIDUS";
        charset[charset["DIGIT_ZERO"] = 48] = "DIGIT_ZERO";
        charset[charset["DIGIT_ONE"] = 49] = "DIGIT_ONE";
        charset[charset["DIGIT_TWO"] = 50] = "DIGIT_TWO";
        charset[charset["DIGIT_THREE"] = 51] = "DIGIT_THREE";
        charset[charset["DIGIT_FOUR"] = 52] = "DIGIT_FOUR";
        charset[charset["DIGIT_FIVE"] = 53] = "DIGIT_FIVE";
        charset[charset["DIGIT_SIX"] = 54] = "DIGIT_SIX";
        charset[charset["DIGIT_SEVEN"] = 55] = "DIGIT_SEVEN";
        charset[charset["DIGIT_EIGHT"] = 56] = "DIGIT_EIGHT";
        charset[charset["DIGIT_NINE"] = 57] = "DIGIT_NINE";
        charset[charset["COLON"] = 58] = "COLON";
        charset[charset["SEMICOLON"] = 59] = "SEMICOLON";
        charset[charset["LESS_THAN_SIGN"] = 60] = "LESS_THAN_SIGN";
        charset[charset["EQUALS_SIGN"] = 61] = "EQUALS_SIGN";
        charset[charset["GREATER_THAN_SIGN"] = 62] = "GREATER_THAN_SIGN";
        charset[charset["QUESTION_MARK"] = 63] = "QUESTION_MARK";
        charset[charset["COMMERCIAL_AT"] = 64] = "COMMERCIAL_AT";
        charset[charset["LATIN_CAPITAL_LETTER_A"] = 65] = "LATIN_CAPITAL_LETTER_A";
        charset[charset["LATIN_CAPITAL_LETTER_B"] = 66] = "LATIN_CAPITAL_LETTER_B";
        charset[charset["LATIN_CAPITAL_LETTER_C"] = 67] = "LATIN_CAPITAL_LETTER_C";
        charset[charset["LATIN_CAPITAL_LETTER_D"] = 68] = "LATIN_CAPITAL_LETTER_D";
        charset[charset["LATIN_CAPITAL_LETTER_E"] = 69] = "LATIN_CAPITAL_LETTER_E";
        charset[charset["LATIN_CAPITAL_LETTER_F"] = 70] = "LATIN_CAPITAL_LETTER_F";
        charset[charset["LATIN_CAPITAL_LETTER_G"] = 71] = "LATIN_CAPITAL_LETTER_G";
        charset[charset["LATIN_CAPITAL_LETTER_H"] = 72] = "LATIN_CAPITAL_LETTER_H";
        charset[charset["LATIN_CAPITAL_LETTER_I"] = 73] = "LATIN_CAPITAL_LETTER_I";
        charset[charset["LATIN_CAPITAL_LETTER_J"] = 74] = "LATIN_CAPITAL_LETTER_J";
        charset[charset["LATIN_CAPITAL_LETTER_K"] = 75] = "LATIN_CAPITAL_LETTER_K";
        charset[charset["LATIN_CAPITAL_LETTER_L"] = 76] = "LATIN_CAPITAL_LETTER_L";
        charset[charset["LATIN_CAPITAL_LETTER_M"] = 77] = "LATIN_CAPITAL_LETTER_M";
        charset[charset["LATIN_CAPITAL_LETTER_N"] = 78] = "LATIN_CAPITAL_LETTER_N";
        charset[charset["LATIN_CAPITAL_LETTER_O"] = 79] = "LATIN_CAPITAL_LETTER_O";
        charset[charset["LATIN_CAPITAL_LETTER_P"] = 80] = "LATIN_CAPITAL_LETTER_P";
        charset[charset["LATIN_CAPITAL_LETTER_Q"] = 81] = "LATIN_CAPITAL_LETTER_Q";
        charset[charset["LATIN_CAPITAL_LETTER_R"] = 82] = "LATIN_CAPITAL_LETTER_R";
        charset[charset["LATIN_CAPITAL_LETTER_S"] = 83] = "LATIN_CAPITAL_LETTER_S";
        charset[charset["LATIN_CAPITAL_LETTER_T"] = 84] = "LATIN_CAPITAL_LETTER_T";
        charset[charset["LATIN_CAPITAL_LETTER_U"] = 85] = "LATIN_CAPITAL_LETTER_U";
        charset[charset["LATIN_CAPITAL_LETTER_V"] = 86] = "LATIN_CAPITAL_LETTER_V";
        charset[charset["LATIN_CAPITAL_LETTER_W"] = 87] = "LATIN_CAPITAL_LETTER_W";
        charset[charset["LATIN_CAPITAL_LETTER_X"] = 88] = "LATIN_CAPITAL_LETTER_X";
        charset[charset["LATIN_CAPITAL_LETTER_Y"] = 89] = "LATIN_CAPITAL_LETTER_Y";
        charset[charset["LATIN_CAPITAL_LETTER_Z"] = 90] = "LATIN_CAPITAL_LETTER_Z";
        charset[charset["LEFT_SQUARE_BRACKET"] = 91] = "LEFT_SQUARE_BRACKET";
        charset[charset["REVERSE_SOLIDUS"] = 92] = "REVERSE_SOLIDUS";
        charset[charset["RIGHT_SQUARE_BRACKET"] = 93] = "RIGHT_SQUARE_BRACKET";
        charset[charset["CIRCUMFLEX_ACCENT"] = 94] = "CIRCUMFLEX_ACCENT";
        charset[charset["LOW_LINE"] = 95] = "LOW_LINE";
        charset[charset["GRAVE_ACCENT"] = 96] = "GRAVE_ACCENT";
        charset[charset["LATIN_SMALL_LETTER_A"] = 97] = "LATIN_SMALL_LETTER_A";
        charset[charset["LATIN_SMALL_LETTER_B"] = 98] = "LATIN_SMALL_LETTER_B";
        charset[charset["LATIN_SMALL_LETTER_C"] = 99] = "LATIN_SMALL_LETTER_C";
        charset[charset["LATIN_SMALL_LETTER_D"] = 100] = "LATIN_SMALL_LETTER_D";
        charset[charset["LATIN_SMALL_LETTER_E"] = 101] = "LATIN_SMALL_LETTER_E";
        charset[charset["LATIN_SMALL_LETTER_F"] = 102] = "LATIN_SMALL_LETTER_F";
        charset[charset["LATIN_SMALL_LETTER_G"] = 103] = "LATIN_SMALL_LETTER_G";
        charset[charset["LATIN_SMALL_LETTER_H"] = 104] = "LATIN_SMALL_LETTER_H";
        charset[charset["LATIN_SMALL_LETTER_I"] = 105] = "LATIN_SMALL_LETTER_I";
        charset[charset["LATIN_SMALL_LETTER_J"] = 106] = "LATIN_SMALL_LETTER_J";
        charset[charset["LATIN_SMALL_LETTER_K"] = 107] = "LATIN_SMALL_LETTER_K";
        charset[charset["LATIN_SMALL_LETTER_L"] = 108] = "LATIN_SMALL_LETTER_L";
        charset[charset["LATIN_SMALL_LETTER_M"] = 109] = "LATIN_SMALL_LETTER_M";
        charset[charset["LATIN_SMALL_LETTER_N"] = 110] = "LATIN_SMALL_LETTER_N";
        charset[charset["LATIN_SMALL_LETTER_O"] = 111] = "LATIN_SMALL_LETTER_O";
        charset[charset["LATIN_SMALL_LETTER_P"] = 112] = "LATIN_SMALL_LETTER_P";
        charset[charset["LATIN_SMALL_LETTER_Q"] = 113] = "LATIN_SMALL_LETTER_Q";
        charset[charset["LATIN_SMALL_LETTER_R"] = 114] = "LATIN_SMALL_LETTER_R";
        charset[charset["LATIN_SMALL_LETTER_S"] = 115] = "LATIN_SMALL_LETTER_S";
        charset[charset["LATIN_SMALL_LETTER_T"] = 116] = "LATIN_SMALL_LETTER_T";
        charset[charset["LATIN_SMALL_LETTER_U"] = 117] = "LATIN_SMALL_LETTER_U";
        charset[charset["LATIN_SMALL_LETTER_V"] = 118] = "LATIN_SMALL_LETTER_V";
        charset[charset["LATIN_SMALL_LETTER_W"] = 119] = "LATIN_SMALL_LETTER_W";
        charset[charset["LATIN_SMALL_LETTER_X"] = 120] = "LATIN_SMALL_LETTER_X";
        charset[charset["LATIN_SMALL_LETTER_Y"] = 121] = "LATIN_SMALL_LETTER_Y";
        charset[charset["LATIN_SMALL_LETTER_Z"] = 122] = "LATIN_SMALL_LETTER_Z";
        charset[charset["LEFT_CURLY_BRACKET"] = 123] = "LEFT_CURLY_BRACKET";
        charset[charset["VERTICAL_LINE"] = 124] = "VERTICAL_LINE";
        charset[charset["RIGHT_CURLY_BRACKET"] = 125] = "RIGHT_CURLY_BRACKET";
        charset[charset["TILDE"] = 126] = "TILDE";
    })(charset || (charset = {}));
    var escapedSequences = (_a = {},
        _a[charset.QUOTATION_MARK] = charset.QUOTATION_MARK,
        _a[charset.REVERSE_SOLIDUS] = charset.REVERSE_SOLIDUS,
        _a[charset.SOLIDUS] = charset.SOLIDUS,
        _a[charset.LATIN_SMALL_LETTER_B] = charset.BACKSPACE,
        _a[charset.LATIN_SMALL_LETTER_F] = charset.FORM_FEED,
        _a[charset.LATIN_SMALL_LETTER_N] = charset.NEWLINE,
        _a[charset.LATIN_SMALL_LETTER_R] = charset.CARRIAGE_RETURN,
        _a[charset.LATIN_SMALL_LETTER_T] = charset.TAB,
        _a);

    var utf8 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get charset () { return charset; },
        escapedSequences: escapedSequences
    });

    var NonBufferedString = /** @class */ (function () {
        function NonBufferedString() {
            this.decoder = new TextDecoder("utf-8");
            this.string = "";
            this.byteLength = 0;
        }
        NonBufferedString.prototype.appendChar = function (char) {
            this.string += String.fromCharCode(char);
            this.byteLength += 1;
        };
        NonBufferedString.prototype.appendBuf = function (buf, start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = buf.length; }
            this.string += this.decoder.decode(buf.subarray(start, end));
            this.byteLength += end - start;
        };
        NonBufferedString.prototype.reset = function () {
            this.string = "";
            this.byteLength = 0;
        };
        NonBufferedString.prototype.toString = function () {
            return this.string;
        };
        return NonBufferedString;
    }());
    var BufferedString = /** @class */ (function () {
        function BufferedString(bufferSize) {
            this.decoder = new TextDecoder("utf-8");
            this.bufferOffset = 0;
            this.string = "";
            this.byteLength = 0;
            this.buffer = new Uint8Array(bufferSize);
        }
        BufferedString.prototype.appendChar = function (char) {
            if (this.bufferOffset >= this.buffer.length)
                this.flushStringBuffer();
            this.buffer[this.bufferOffset++] = char;
            this.byteLength += 1;
        };
        BufferedString.prototype.appendBuf = function (buf, start, end) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = buf.length; }
            var size = end - start;
            if (this.bufferOffset + size > this.buffer.length)
                this.flushStringBuffer();
            this.buffer.set(buf.subarray(start, end), this.bufferOffset);
            this.bufferOffset += size;
            this.byteLength += size;
        };
        BufferedString.prototype.flushStringBuffer = function () {
            this.string += this.decoder.decode(this.buffer.subarray(0, this.bufferOffset));
            this.bufferOffset = 0;
        };
        BufferedString.prototype.reset = function () {
            this.string = "";
            this.bufferOffset = 0;
            this.byteLength = 0;
        };
        BufferedString.prototype.toString = function () {
            this.flushStringBuffer();
            return this.string;
        };
        return BufferedString;
    }());

    exports.TokenType = void 0;
    (function (TokenType) {
        TokenType[TokenType["LEFT_BRACE"] = 1] = "LEFT_BRACE";
        TokenType[TokenType["RIGHT_BRACE"] = 2] = "RIGHT_BRACE";
        TokenType[TokenType["LEFT_BRACKET"] = 3] = "LEFT_BRACKET";
        TokenType[TokenType["RIGHT_BRACKET"] = 4] = "RIGHT_BRACKET";
        TokenType[TokenType["COLON"] = 5] = "COLON";
        TokenType[TokenType["COMMA"] = 6] = "COMMA";
        TokenType[TokenType["TRUE"] = 7] = "TRUE";
        TokenType[TokenType["FALSE"] = 8] = "FALSE";
        TokenType[TokenType["NULL"] = 9] = "NULL";
        TokenType[TokenType["STRING"] = 10] = "STRING";
        TokenType[TokenType["NUMBER"] = 11] = "NUMBER";
        TokenType[TokenType["SEPARATOR"] = 12] = "SEPARATOR";
    })(exports.TokenType || (exports.TokenType = {}));

    var LEFT_BRACE$1 = exports.TokenType.LEFT_BRACE, RIGHT_BRACE$1 = exports.TokenType.RIGHT_BRACE, LEFT_BRACKET$1 = exports.TokenType.LEFT_BRACKET, RIGHT_BRACKET$1 = exports.TokenType.RIGHT_BRACKET, COLON$1 = exports.TokenType.COLON, COMMA$1 = exports.TokenType.COMMA, TRUE$1 = exports.TokenType.TRUE, FALSE$1 = exports.TokenType.FALSE, NULL$1 = exports.TokenType.NULL, STRING$1 = exports.TokenType.STRING, NUMBER$1 = exports.TokenType.NUMBER;
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
    var defaultOpts$1 = {
        stringBufferSize: 0,
        numberBufferSize: 0,
        separator: undefined,
    };
    var TokenizerError = /** @class */ (function (_super) {
        __extends(TokenizerError, _super);
        function TokenizerError(message) {
            var _this = _super.call(this, message) || this;
            // Typescript is broken. This is a workaround
            Object.setPrototypeOf(_this, TokenizerError.prototype);
            return _this;
        }
        return TokenizerError;
    }(Error));
    var Tokenizer = /** @class */ (function () {
        function Tokenizer(opts) {
            this.state = TokenizerStates.START;
            this.separatorIndex = 0;
            this.unicode = undefined; // unicode escapes
            this.highSurrogate = undefined;
            this.bytes_remaining = 0; // number of bytes remaining in multi byte utf8 char to read after split boundary
            this.bytes_in_sequence = 0; // bytes in multi byte utf8 char to read
            this.char_split_buffer = new Uint8Array(4); // for rebuilding chars split before boundary is reached
            this.encoder = new TextEncoder();
            this.offset = -1;
            opts = __assign(__assign({}, defaultOpts$1), opts);
            this.bufferedString =
                opts.stringBufferSize && opts.stringBufferSize > 4
                    ? new BufferedString(opts.stringBufferSize)
                    : new NonBufferedString();
            this.bufferedNumber =
                opts.numberBufferSize && opts.numberBufferSize > 0
                    ? new BufferedString(opts.numberBufferSize)
                    : new NonBufferedString();
            this.separator = opts.separator;
            this.separatorBytes = opts.separator
                ? this.encoder.encode(opts.separator)
                : undefined;
        }
        Object.defineProperty(Tokenizer.prototype, "isEnded", {
            get: function () {
                return this.state === TokenizerStates.ENDED;
            },
            enumerable: false,
            configurable: true
        });
        Tokenizer.prototype.write = function (input) {
            var buffer;
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
            for (var i = 0; i < buffer.length; i += 1) {
                var n = buffer[i]; // get current byte from buffer
                switch (this.state) {
                    case TokenizerStates.START:
                        this.offset += 1;
                        if (this.separatorBytes && n === this.separatorBytes[0]) {
                            if (this.separatorBytes.length === 1) {
                                this.state = TokenizerStates.START;
                                this.onToken(exports.TokenType.SEPARATOR, this.separator, this.offset + this.separatorBytes.length - 1);
                                continue;
                            }
                            this.state = TokenizerStates.SEPARATOR;
                            continue;
                        }
                        if (n === charset.SPACE ||
                            n === charset.NEWLINE ||
                            n === charset.CARRIAGE_RETURN ||
                            n === charset.TAB) {
                            // whitespace
                            continue;
                        }
                        if (n === charset.LEFT_CURLY_BRACKET) {
                            this.onToken(LEFT_BRACE$1, "{", this.offset);
                            continue;
                        }
                        if (n === charset.RIGHT_CURLY_BRACKET) {
                            this.onToken(RIGHT_BRACE$1, "}", this.offset);
                            continue;
                        }
                        if (n === charset.LEFT_SQUARE_BRACKET) {
                            this.onToken(LEFT_BRACKET$1, "[", this.offset);
                            continue;
                        }
                        if (n === charset.RIGHT_SQUARE_BRACKET) {
                            this.onToken(RIGHT_BRACKET$1, "]", this.offset);
                            continue;
                        }
                        if (n === charset.COLON) {
                            this.onToken(COLON$1, ":", this.offset);
                            continue;
                        }
                        if (n === charset.COMMA) {
                            this.onToken(COMMA$1, ",", this.offset);
                            continue;
                        }
                        if (n === charset.LATIN_SMALL_LETTER_T) {
                            this.state = TokenizerStates.TRUE1;
                            continue;
                        }
                        if (n === charset.LATIN_SMALL_LETTER_F) {
                            this.state = TokenizerStates.FALSE1;
                            continue;
                        }
                        if (n === charset.LATIN_SMALL_LETTER_N) {
                            this.state = TokenizerStates.NULL1;
                            continue;
                        }
                        if (n === charset.QUOTATION_MARK) {
                            this.bufferedString.reset();
                            this.state = TokenizerStates.STRING_DEFAULT;
                            continue;
                        }
                        if (n >= charset.DIGIT_ONE && n <= charset.DIGIT_NINE) {
                            this.bufferedNumber.reset();
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_INITIAL_NON_ZERO;
                            continue;
                        }
                        if (n === charset.DIGIT_ZERO) {
                            this.bufferedNumber.reset();
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_INITIAL_ZERO;
                            continue;
                        }
                        if (n === charset.HYPHEN_MINUS) {
                            this.bufferedNumber.reset();
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_INITIAL_MINUS;
                            continue;
                        }
                        break;
                    // STRING
                    case TokenizerStates.STRING_DEFAULT:
                        if (n === charset.QUOTATION_MARK) {
                            var string = this.bufferedString.toString();
                            this.state = TokenizerStates.START;
                            this.onToken(STRING$1, string, this.offset);
                            this.offset += this.bufferedString.byteLength + 1;
                            continue;
                        }
                        if (n === charset.REVERSE_SOLIDUS) {
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
                        if (n >= charset.SPACE) {
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
                        var controlChar = escapedSequences[n];
                        if (controlChar) {
                            this.bufferedString.appendChar(controlChar);
                            this.state = TokenizerStates.STRING_DEFAULT;
                            continue;
                        }
                        if (n === charset.LATIN_SMALL_LETTER_U) {
                            this.unicode = "";
                            this.state = TokenizerStates.STRING_UNICODE_DIGIT_1;
                            continue;
                        }
                        break;
                    case TokenizerStates.STRING_UNICODE_DIGIT_1:
                    case TokenizerStates.STRING_UNICODE_DIGIT_2:
                    case TokenizerStates.STRING_UNICODE_DIGIT_3:
                        if ((n >= charset.DIGIT_ZERO && n <= charset.DIGIT_NINE) ||
                            (n >= charset.LATIN_CAPITAL_LETTER_A &&
                                n <= charset.LATIN_CAPITAL_LETTER_F) ||
                            (n >= charset.LATIN_SMALL_LETTER_A &&
                                n <= charset.LATIN_SMALL_LETTER_F)) {
                            this.unicode += String.fromCharCode(n);
                            this.state += 1;
                            continue;
                        }
                        break;
                    case TokenizerStates.STRING_UNICODE_DIGIT_4:
                        if ((n >= charset.DIGIT_ZERO && n <= charset.DIGIT_NINE) ||
                            (n >= charset.LATIN_CAPITAL_LETTER_A &&
                                n <= charset.LATIN_CAPITAL_LETTER_F) ||
                            (n >= charset.LATIN_SMALL_LETTER_A &&
                                n <= charset.LATIN_SMALL_LETTER_F)) {
                            var intVal = parseInt(this.unicode + String.fromCharCode(n), 16);
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
                        if (n === charset.DIGIT_ZERO) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_INITIAL_ZERO;
                            continue;
                        }
                        if (n >= charset.DIGIT_ONE && n <= charset.DIGIT_NINE) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_INITIAL_NON_ZERO;
                            continue;
                        }
                        break;
                    case TokenizerStates.NUMBER_AFTER_INITIAL_ZERO:
                        if (n === charset.FULL_STOP) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_FULL_STOP;
                            continue;
                        }
                        if (n === charset.LATIN_SMALL_LETTER_E ||
                            n === charset.LATIN_CAPITAL_LETTER_E) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_E;
                            continue;
                        }
                        i -= 1;
                        this.state = TokenizerStates.START;
                        this.emitNumber();
                        continue;
                    case TokenizerStates.NUMBER_AFTER_INITIAL_NON_ZERO:
                        if (n >= charset.DIGIT_ZERO && n <= charset.DIGIT_NINE) {
                            this.bufferedNumber.appendChar(n);
                            continue;
                        }
                        if (n === charset.FULL_STOP) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_FULL_STOP;
                            continue;
                        }
                        if (n === charset.LATIN_SMALL_LETTER_E ||
                            n === charset.LATIN_CAPITAL_LETTER_E) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_E;
                            continue;
                        }
                        i -= 1;
                        this.state = TokenizerStates.START;
                        this.emitNumber();
                        continue;
                    case TokenizerStates.NUMBER_AFTER_FULL_STOP:
                        if (n >= charset.DIGIT_ZERO && n <= charset.DIGIT_NINE) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_DECIMAL;
                            continue;
                        }
                        break;
                    case TokenizerStates.NUMBER_AFTER_DECIMAL:
                        if (n >= charset.DIGIT_ZERO && n <= charset.DIGIT_NINE) {
                            this.bufferedNumber.appendChar(n);
                            continue;
                        }
                        if (n === charset.LATIN_SMALL_LETTER_E ||
                            n === charset.LATIN_CAPITAL_LETTER_E) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_E;
                            continue;
                        }
                        i -= 1;
                        this.state = TokenizerStates.START;
                        this.emitNumber();
                        continue;
                    case TokenizerStates.NUMBER_AFTER_E:
                        if (n === charset.PLUS_SIGN || n === charset.HYPHEN_MINUS) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_E_AND_SIGN;
                            continue;
                        }
                    // Allow cascading
                    case TokenizerStates.NUMBER_AFTER_E_AND_SIGN:
                        if (n >= charset.DIGIT_ZERO && n <= charset.DIGIT_NINE) {
                            this.bufferedNumber.appendChar(n);
                            this.state = TokenizerStates.NUMBER_AFTER_E_AND_DIGIT;
                            continue;
                        }
                        break;
                    case TokenizerStates.NUMBER_AFTER_E_AND_DIGIT:
                        if (n >= charset.DIGIT_ZERO && n <= charset.DIGIT_NINE) {
                            this.bufferedNumber.appendChar(n);
                            continue;
                        }
                        i -= 1;
                        this.state = TokenizerStates.START;
                        this.emitNumber();
                        continue;
                    // TRUE
                    case TokenizerStates.TRUE1:
                        if (n === charset.LATIN_SMALL_LETTER_R) {
                            this.state = TokenizerStates.TRUE2;
                            continue;
                        }
                        break;
                    case TokenizerStates.TRUE2:
                        if (n === charset.LATIN_SMALL_LETTER_U) {
                            this.state = TokenizerStates.TRUE3;
                            continue;
                        }
                        break;
                    case TokenizerStates.TRUE3:
                        if (n === charset.LATIN_SMALL_LETTER_E) {
                            this.state = TokenizerStates.START;
                            this.onToken(TRUE$1, true, this.offset);
                            this.offset += 3;
                            continue;
                        }
                        break;
                    // FALSE
                    case TokenizerStates.FALSE1:
                        if (n === charset.LATIN_SMALL_LETTER_A) {
                            this.state = TokenizerStates.FALSE2;
                            continue;
                        }
                        break;
                    case TokenizerStates.FALSE2:
                        if (n === charset.LATIN_SMALL_LETTER_L) {
                            this.state = TokenizerStates.FALSE3;
                            continue;
                        }
                        break;
                    case TokenizerStates.FALSE3:
                        if (n === charset.LATIN_SMALL_LETTER_S) {
                            this.state = TokenizerStates.FALSE4;
                            continue;
                        }
                        break;
                    case TokenizerStates.FALSE4:
                        if (n === charset.LATIN_SMALL_LETTER_E) {
                            this.state = TokenizerStates.START;
                            this.onToken(FALSE$1, false, this.offset);
                            this.offset += 4;
                            continue;
                        }
                        break;
                    // NULL
                    case TokenizerStates.NULL1:
                        if (n === charset.LATIN_SMALL_LETTER_U) {
                            this.state = TokenizerStates.NULL2;
                            continue;
                        }
                        break;
                    case TokenizerStates.NULL2:
                        if (n === charset.LATIN_SMALL_LETTER_L) {
                            this.state = TokenizerStates.NULL3;
                            continue;
                        }
                        break;
                    case TokenizerStates.NULL3:
                        if (n === charset.LATIN_SMALL_LETTER_L) {
                            this.state = TokenizerStates.START;
                            this.onToken(NULL$1, null, this.offset);
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
                            this.onToken(exports.TokenType.SEPARATOR, this.separator, this.offset + this.separatorIndex);
                            this.separatorIndex = 0;
                        }
                        continue;
                    case TokenizerStates.ENDED:
                        if (n === charset.SPACE ||
                            n === charset.NEWLINE ||
                            n === charset.CARRIAGE_RETURN ||
                            n === charset.TAB) {
                            // whitespace
                            continue;
                        }
                }
                this.error(new TokenizerError("Unexpected \"".concat(String.fromCharCode(n), "\" at position \"").concat(i, "\" in state ").concat(TokenizerStates[this.state])));
                return;
            }
        };
        Tokenizer.prototype.emitNumber = function () {
            this.onToken(NUMBER$1, this.parseNumber(this.bufferedNumber.toString()), this.offset);
            this.offset += this.bufferedNumber.byteLength - 1;
        };
        Tokenizer.prototype.parseNumber = function (numberStr) {
            return Number(numberStr);
        };
        Tokenizer.prototype.error = function (err) {
            if (this.state !== TokenizerStates.ENDED) {
                this.state = TokenizerStates.ERROR;
            }
            this.onError(err);
        };
        Tokenizer.prototype.end = function () {
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
                    this.error(new TokenizerError("Tokenizer ended in the middle of a token (state: ".concat(TokenizerStates[this.state], "). Either not all the data was received or the data was invalid.")));
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Tokenizer.prototype.onToken = function (token, value, offset) {
            // Override me
            throw new TokenizerError('Can\'t emit tokens before the "onToken" callback has been set up.');
        };
        Tokenizer.prototype.onError = function (err) {
            // Override me
            throw err;
        };
        Tokenizer.prototype.onEnd = function () {
            // Override me
        };
        return Tokenizer;
    }());

    var LEFT_BRACE = exports.TokenType.LEFT_BRACE, RIGHT_BRACE = exports.TokenType.RIGHT_BRACE, LEFT_BRACKET = exports.TokenType.LEFT_BRACKET, RIGHT_BRACKET = exports.TokenType.RIGHT_BRACKET, COLON = exports.TokenType.COLON, COMMA = exports.TokenType.COMMA, TRUE = exports.TokenType.TRUE, FALSE = exports.TokenType.FALSE, NULL = exports.TokenType.NULL, STRING = exports.TokenType.STRING, NUMBER = exports.TokenType.NUMBER, SEPARATOR = exports.TokenType.SEPARATOR;
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
    })(TokenParserMode || (TokenParserMode = {}));
    var defaultOpts = {
        paths: undefined,
        keepStack: true,
        separator: undefined,
    };
    var TokenParserError = /** @class */ (function (_super) {
        __extends(TokenParserError, _super);
        function TokenParserError(message) {
            var _this = _super.call(this, message) || this;
            // Typescript is broken. This is a workaround
            Object.setPrototypeOf(_this, TokenParserError.prototype);
            return _this;
        }
        return TokenParserError;
    }(Error));
    var TokenParser = /** @class */ (function () {
        function TokenParser(opts) {
            this.state = TokenParserState.VALUE;
            this.mode = undefined;
            this.key = undefined;
            this.value = undefined;
            this.stack = [];
            opts = __assign(__assign({}, defaultOpts), opts);
            if (opts.paths) {
                this.paths = opts.paths.map(function (path) {
                    if (path === undefined || path === "$*")
                        return undefined;
                    if (!path.startsWith("$"))
                        throw new TokenParserError("Invalid selector \"".concat(path, "\". Should start with \"$\"."));
                    var pathParts = path.split(".").slice(1);
                    if (pathParts.includes(""))
                        throw new TokenParserError("Invalid selector \"".concat(path, "\". \"..\" syntax not supported."));
                    return pathParts;
                });
            }
            this.keepStack = opts.keepStack;
            this.separator = opts.separator;
        }
        TokenParser.prototype.shouldEmit = function () {
            var _this = this;
            if (!this.paths)
                return true;
            return this.paths.some(function (path) {
                var _a;
                if (path === undefined)
                    return true;
                if (path.length !== _this.stack.length)
                    return false;
                for (var i = 0; i < path.length - 1; i++) {
                    var selector_1 = path[i];
                    var key = _this.stack[i + 1].key;
                    if (selector_1 === "*")
                        continue;
                    if (selector_1 !== key)
                        return false;
                }
                var selector = path[path.length - 1];
                if (selector === "*")
                    return true;
                return selector === ((_a = _this.key) === null || _a === void 0 ? void 0 : _a.toString());
            });
        };
        TokenParser.prototype.push = function () {
            this.stack.push({
                key: this.key,
                value: this.value,
                mode: this.mode,
                emit: this.shouldEmit(),
            });
        };
        TokenParser.prototype.pop = function () {
            var _a;
            var value = this.value;
            var emit;
            (_a = this.stack.pop(), this.key = _a.key, this.value = _a.value, this.mode = _a.mode, emit = _a.emit);
            this.state =
                this.mode !== undefined ? TokenParserState.COMMA : TokenParserState.VALUE;
            this.emit(value, emit);
        };
        TokenParser.prototype.emit = function (value, emit) {
            if (!this.keepStack &&
                this.value &&
                this.stack.every(function (item) { return !item.emit; })) {
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
        };
        Object.defineProperty(TokenParser.prototype, "isEnded", {
            get: function () {
                return this.state === TokenParserState.ENDED;
            },
            enumerable: false,
            configurable: true
        });
        TokenParser.prototype.write = function (token, value) {
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
                        var val = {};
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
                        var val = [];
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
            this.error(new TokenParserError("Unexpected ".concat(exports.TokenType[token], " (").concat(JSON.stringify(value), ") in state ").concat(TokenParserState[this.state])));
        };
        TokenParser.prototype.error = function (err) {
            if (this.state !== TokenParserState.ENDED) {
                this.state = TokenParserState.ERROR;
            }
            this.onError(err);
        };
        TokenParser.prototype.end = function () {
            if ((this.state !== TokenParserState.VALUE &&
                this.state !== TokenParserState.SEPARATOR) ||
                this.stack.length > 0) {
                this.error(new Error("Parser ended in mid-parsing (state: ".concat(TokenParserState[this.state], "). Either not all the data was received or the data was invalid.")));
            }
            else {
                this.state = TokenParserState.ENDED;
                this.onEnd();
            }
        };
        TokenParser.prototype.onValue = function (
        /* eslint-disable @typescript-eslint/no-unused-vars */
        value, key, parent, stack
        /* eslint-enable @typescript-eslint/no-unused-vars */
        ) {
            // Override me
            throw new TokenParserError('Can\'t emit data before the "onValue" callback has been set up.');
        };
        TokenParser.prototype.onError = function (err) {
            // Override me
            throw err;
        };
        TokenParser.prototype.onEnd = function () {
            // Override me
        };
        return TokenParser;
    }());

    var JSONParser = /** @class */ (function () {
        function JSONParser(opts) {
            var _this = this;
            if (opts === void 0) { opts = {}; }
            this.tokenizer = new Tokenizer(opts);
            this.tokenParser = new TokenParser(opts);
            this.tokenizer.onToken = this.tokenParser.write.bind(this.tokenParser);
            this.tokenizer.onEnd = function () {
                if (!_this.tokenParser.isEnded)
                    _this.tokenParser.end();
            };
            this.tokenParser.onError = this.tokenizer.error.bind(this.tokenizer);
            this.tokenParser.onEnd = function () {
                if (!_this.tokenizer.isEnded)
                    _this.tokenizer.end();
            };
        }
        Object.defineProperty(JSONParser.prototype, "isEnded", {
            get: function () {
                return this.tokenizer.isEnded && this.tokenParser.isEnded;
            },
            enumerable: false,
            configurable: true
        });
        JSONParser.prototype.write = function (input) {
            this.tokenizer.write(input);
        };
        JSONParser.prototype.end = function () {
            this.tokenizer.end();
        };
        Object.defineProperty(JSONParser.prototype, "onToken", {
            set: function (cb) {
                this.tokenizer.onToken = cb;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(JSONParser.prototype, "onValue", {
            set: function (cb) {
                this.tokenParser.onValue = cb;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(JSONParser.prototype, "onError", {
            set: function (cb) {
                this.tokenizer.onError = cb;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(JSONParser.prototype, "onEnd", {
            set: function (cb) {
                var _this = this;
                this.tokenParser.onEnd = function () {
                    if (!_this.tokenizer.isEnded)
                        _this.tokenizer.end();
                    cb.call(_this.tokenParser);
                };
            },
            enumerable: false,
            configurable: true
        });
        return JSONParser;
    }());

    exports.JSONParser = JSONParser;
    exports.TokenParser = TokenParser;
    exports.Tokenizer = Tokenizer;
    exports.utf8 = utf8;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
