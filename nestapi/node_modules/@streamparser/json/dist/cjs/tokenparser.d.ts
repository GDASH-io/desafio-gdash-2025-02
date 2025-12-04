import { TokenType } from "./utils/constants";
import { JsonPrimitive, JsonKey, JsonObject, JsonArray, JsonStruct } from "./utils/types";
export declare enum TokenParserMode {
    OBJECT = 0,
    ARRAY = 1
}
export interface StackElement {
    key: JsonKey;
    value: JsonStruct;
    mode: TokenParserMode | undefined;
    emit: boolean;
}
export interface TokenParserOptions {
    paths?: string[];
    keepStack?: boolean;
    separator?: string;
}
export declare class TokenParserError extends Error {
    constructor(message: string);
}
export default class TokenParser {
    private readonly paths?;
    private readonly keepStack;
    private readonly separator?;
    private state;
    private mode;
    private key;
    private value;
    private stack;
    constructor(opts?: TokenParserOptions);
    private shouldEmit;
    private push;
    private pop;
    private emit;
    get isEnded(): boolean;
    write(token: TokenType.LEFT_BRACE, value: "{"): void;
    write(token: TokenType.RIGHT_BRACE, value: "}"): void;
    write(token: TokenType.LEFT_BRACKET, value: "["): void;
    write(token: TokenType.RIGHT_BRACKET, value: "]"): void;
    write(token: TokenType.COLON, value: ":"): void;
    write(token: TokenType.COMMA, value: ","): void;
    write(token: TokenType.TRUE, value: true): void;
    write(token: TokenType.FALSE, value: false): void;
    write(token: TokenType.NULL, value: null): void;
    write(token: TokenType.STRING, value: string): void;
    write(token: TokenType.NUMBER, value: number): void;
    write(token: TokenType.SEPARATOR, value: string): void;
    error(err: Error): void;
    end(): void;
    onValue(value: JsonPrimitive | JsonStruct, key: number, parent: JsonArray, stack: StackElement[]): void;
    onValue(value: JsonPrimitive | JsonStruct, key: string, parent: JsonObject, stack: StackElement[]): void;
    onValue(value: JsonPrimitive | JsonStruct, key: undefined, parent: undefined, stack: []): void;
    onError(err: Error): void;
    onEnd(): void;
}
