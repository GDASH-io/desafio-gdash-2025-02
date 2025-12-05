export declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: Environment;
    MONGODB_URI: string;
    JWT_SECRET: string;
    GEMINI_API_KEY: string;
    DEFAULT_ADMIN_EMAIL: string;
    DEFAULT_ADMIN_PASSWORD: string;
    RABBITMQ_HOST: string;
    RABBITMQ_PORT: string;
}
