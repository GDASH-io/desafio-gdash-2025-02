"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
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
})(TokenType = exports.TokenType || (exports.TokenType = {}));
