import { ExplorerResult } from 'src/types';

export interface ExplorerPort {
  getAll(page_param: number): Promise<ExplorerResult>;
}
