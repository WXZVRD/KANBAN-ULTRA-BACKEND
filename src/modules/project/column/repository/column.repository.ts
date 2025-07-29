import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../entity/project.entity';
import { DeepPartial, Repository } from 'typeorm';
import { ProjectColumn } from '../entity/column.entity';

@Injectable()
export class ProjectColumnRepository {
  public constructor(
    @InjectRepository(ProjectColumn)
    private readonly repo: Repository<ProjectColumn>,
  ) {}

  public async create(columnToCreate: ProjectColumn): Promise<ProjectColumn> {
    return this.repo.create(columnToCreate);
  }

  public async save(columnToSave: ProjectColumn): Promise<ProjectColumn> {
    return this.repo.save(columnToSave);
  }

  public async createAndSave(
    columnToSave: DeepPartial<ProjectColumn>,
  ): Promise<ProjectColumn> {
    const createdColumn: ProjectColumn = this.repo.create(columnToSave);

    return this.repo.save(createdColumn);
  }
}
