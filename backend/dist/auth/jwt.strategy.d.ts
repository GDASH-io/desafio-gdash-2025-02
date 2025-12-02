interface JwtPayload {
    sub: string;
    email: string;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): {
        userId: string;
        email: string;
    };
}
export {};
