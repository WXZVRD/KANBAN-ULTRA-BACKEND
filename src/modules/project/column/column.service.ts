import { Injectable } from '@nestjs/common';
import { ProjectColumnRepository } from './repository/column.repository';

@Injectable()
export class ProjectColumnService {
  public constructor(
    private readonly projectColumnRepository: ProjectColumnRepository,
  ) {}
}
