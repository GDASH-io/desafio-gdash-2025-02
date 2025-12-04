import { TokenType } from "./utils/constants";
export interface TokenizerOptions {
    stringBufferSize?: number;
    numberBufferSize?: number;
    separator?: string;
}
export declare class TokenizerError extends Error {
    constructor(message: string);
}
export default class Tokenizer {
    private state;
    private separator?;
    private separatorBytes?;
    private separatorIndex;
    private bufferedString;
    private bufferedNumber;
    private unicode;
    private highSurrogate;
    private bytes_remaining;
    private bytes_in_sequence;
    private char_split_buffer;
    private encoder;
    private offset;
    constructor(opts?: TokenizerOptions);
    get isEnded(): boolean;
    write(input: Iterable<number> | string): void;
    private emitNumber;
    protected parseNumber(numberStr: string): number;
    error(err: Error): void;
    end(): void;
    onToken(token: TokenType.LEFT_BRACE, value: "{", offset: number): void;
    onToken(token: TokenType.RIGHT_BRACE, value: "}", offset: number): void;
    onToken(token: TokenType.LEFT_BRACKET, value: "[", offset: number): void;
    onToken(token: TokenType.RIGHT_BRACKET, value: "]", offset: number): void;
    onToken(token: TokenType.COLON, value: ":", offset: number): void;
    onToken(token: TokenType.COMMA, value: ",", offset: number): void;
    onToken(token: TokenType.TRUE, value: true, offset: number): void;
    onToken(token: TokenType.FALSE, value: false, offset: number): void;
    onToken(token: TokenType.NULL, value: null, offset: number): void;
    onToken(token: TokenType.STRING, value: string, offset: number): void;
    onToken(token: TokenType.NUMBER, value: number, offset: number): void;
    onToken(token: TokenType.SEPARATOR, value: string, offset: number): void;
    onError(err: Error): void;
    onEnd(): void;
}
