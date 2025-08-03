import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';
import { ProjectColumn } from '../entity/column.entity';

export interface IProjectColumnRepository {
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

  /**
   * Creates a new ProjectColumn entity instance (not saved).
   */
  public async create(
    columnToCreate: DeepPartial<ProjectColumn>,
  ): Promise<ProjectColumn> {
    return this.repo.create(columnToCreate);
  }

  /**
   * Saves an existing ProjectColumn entity to the database.
   */
  public async save(columnToSave: ProjectColumn): Promise<ProjectColumn> {
    return this.repo.save(columnToSave);
  }

  /**
   * Creates and saves a new ProjectColumn entity.
   */
  public async createAndSave(
    columnToSave: DeepPartial<ProjectColumn>,
  ): Promise<ProjectColumn> {
    const createdColumn: ProjectColumn = this.repo.create(columnToSave);

    return this.repo.save(createdColumn);
  }

  /**
   * Finds a column by its title.
   */
  public async findByTitle(title: string): Promise<ProjectColumn | null> {
    return await this.repo.findOne({ where: { title: title } });
  }

  /**
   * Finds a column by either its title or order within a specific project.
   */
  public async findByTitleOrOrder(
    title: string,
    order: number,
    projectId: string,
  ): Promise<ProjectColumn | null> {
    return await this.repo.findOne({
      where: [{ title: title }, { order: order, projectId: projectId }],
    });
  }

  /**
   * Finds all columns belonging to a specific project.
   */
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

  /**
   * Finds a single column by its ID.
   */
  public async findById(columnId: string): Promise<ProjectColumn | null> {
    return await this.repo.findOne({ where: { id: columnId } });
  }

  /**
   * Deletes a column by its ID.
   */
  public async delete(columnId: string): Promise<DeleteResult> {
    return await this.repo.delete({ id: columnId });
  }
}
