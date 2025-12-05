import { SpacexService } from './spacex.service';
export declare class SpacexController {
    private spacexService;
    constructor(spacexService: SpacexService);
    getLaunches(page?: string, limit?: string): Promise<any>;
    getLaunchById(id: string): Promise<any>;
}
