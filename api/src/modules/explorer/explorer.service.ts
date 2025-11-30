import { Inject, Injectable } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { ExplorerPort } from './ports/explorer.ports';

@Injectable()
export class ExplorerService {
  constructor(
    @Inject(commonConstants.ports.EXPLORER)
    private readonly explorerAdapter: ExplorerPort,
  ) {}

  async findAll(page_param: number) {
    return this.explorerAdapter.getAll(page_param);
  }
}
