export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto extends LoginDto {
    name: string;
    password: string;
}
export declare class AuthResponseDto {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}
