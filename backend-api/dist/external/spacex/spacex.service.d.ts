export declare class SpacexService {
    private BASE_URL;
    getLaunches(page?: number, limit?: number): Promise<any>;
    getLaunchById(id: string): Promise<any>;
}
