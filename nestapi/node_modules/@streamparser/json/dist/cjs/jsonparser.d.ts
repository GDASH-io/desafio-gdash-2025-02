import { TokenizerOptions } from "./tokenizer";
import { StackElement, TokenParserOptions } from "./tokenparser";
import { JsonPrimitive, JsonKey, JsonStruct } from "./utils/types";
interface JSONParserOpts extends TokenizerOptions, TokenParserOptions {
}
export default class JSONParser {
    private tokenizer;
    private tokenParser;
    constructor(opts?: JSONParserOpts);
    get isEnded(): boolean;
    write(input: Iterable<number> | string): void;
    end(): void;
    set onToken(cb: (token: number, value: JsonPrimitive, offset: number) => void);
    set onValue(cb: (value: JsonPrimitive | JsonStruct, key: JsonKey | undefined, parent: JsonStruct | undefined, stack: StackElement[]) => void);
    set onError(cb: (err: Error) => void);
    set onEnd(cb: () => void);
}
export {};
