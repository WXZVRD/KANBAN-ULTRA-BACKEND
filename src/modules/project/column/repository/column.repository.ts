import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../entity/project.entity';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';
import { ProjectColumn } from '../entity/column.entity';

interface IProjectColumnRepository {
  create(columnToCreate: DeepPartial<ProjectColumn>): Promise<ProjectColumn>;
  save(columnToSave: ProjectColumn): Promise<ProjectColumn>;
  createAndSave(
    columnToSave: DeepPartial<ProjectColumn>,
  ): Promise<ProjectColumn>;

  findByTitle(title: string): Promise<ProjectColumn | null>;
  findByTitleOrOrder(
    title: string,
    order: number,
    projectId: string,
  ): Promise<ProjectColumn | null>;
  findByProjectId(projectId: string): Promise<ProjectColumn[] | null>;
  findById(columnId: string): Promise<ProjectColumn | null>;

  delete(columnId: string): Promise<DeleteResult>;
}

@Injectable()
export class ProjectColumnRepository implements IProjectColumnRepository {
  public constructor(
    @InjectRepository(ProjectColumn)
    private readonly repo: Repository<ProjectColumn>,
  ) {}

  public async create(
    columnToCreate: DeepPartial<ProjectColumn>,
  ): Promise<ProjectColumn> {
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

  public async findByTitle(title: string): Promise<ProjectColumn | null> {
    return await this.repo.findOne({ where: { title: title } });
  }

  public async findByTitleOrOrder(
    title: string,
    order: number,
    projectId: string,
  ): Promise<ProjectColumn | null> {
    return await this.repo.findOne({
      where: [{ title: title }, { order: order, projectId: projectId }],
    });
  }

  public async findByProjectId(
    projectId: string,
  ): Promise<ProjectColumn[] | null> {
    return await this.repo.find({
      where: {
        projectId: projectId,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  public async findById(columnId: string): Promise<ProjectColumn | null> {
    return await this.repo.findOne({ where: { id: columnId } });
  }

  public async delete(columnId: string): Promise<DeleteResult> {
    return await this.repo.delete({ id: columnId });
  }
}
