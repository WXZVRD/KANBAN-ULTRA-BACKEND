import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, DeleteResult, Repository } from "typeorm";
import { ProjectColumn } from "../entity/column.entity";

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
  delete(projectId: string, title: string): Promise<DeleteResult>;
  findByProjectIdAndTitle(
    projectId: string,
    title: string,
  ): Promise<ProjectColumn | null>;
  reorderColumns(
    projectId: string,
    oldOrder: number,
    newOrder: number,
    columnId: string,
  ): Promise<void>;
}

@Injectable()
export class ProjectColumnRepository implements IProjectColumnRepository {
  public constructor(
    @InjectRepository(ProjectColumn)
    private readonly repo: Repository<ProjectColumn>,
  ) {}

  /**
   * Creates a new ProjectColumn instance (does not persist to DB).
   * @param columnToCreate - Partial data for creating a column
   * @returns ProjectColumn instance
   */
  public async create(
    columnToCreate: DeepPartial<ProjectColumn>,
  ): Promise<ProjectColumn> {
    return this.repo.create(columnToCreate);
  }

  /**
   * Saves an existing ProjectColumn entity to the database.
   * @param columnToSave - Column entity to save
   * @returns Saved ProjectColumn
   */
  public async save(columnToSave: ProjectColumn): Promise<ProjectColumn> {
    return this.repo.save(columnToSave);
  }

  /**
   * Creates and immediately saves a new ProjectColumn entity.
   * @param columnToSave - Partial column data
   * @returns Saved ProjectColumn
   */
  public async createAndSave(
    columnToSave: DeepPartial<ProjectColumn>,
  ): Promise<ProjectColumn> {
    const createdColumn: ProjectColumn = this.repo.create(columnToSave);

    return this.repo.save(createdColumn);
  }

  /**
   * Finds a column by its title.
   * @param title - Column title
   * @returns ProjectColumn or null
   */
  public async findByTitle(title: string): Promise<ProjectColumn | null> {
    return await this.repo.findOne({ where: { title: title } });
  }

  /**
   * Finds a column by its title or order within a project.
   * @param title - Column title
   * @param order - Column order
   * @param projectId - Project ID
   * @returns ProjectColumn or null
   */
  public async findByTitleOrOrder(
    title: string,
    order: number,
    projectId: string,
  ): Promise<ProjectColumn | null> {
    return await this.repo.findOne({
      where: [
        { title: title, projectId: projectId },
        { order: order, projectId: projectId },
      ],
    });
  }

  /**
   * Retrieves all columns for a specific project.
   * @param projectId - Project ID
   * @returns Array of ProjectColumn or null
   */
  public async findByProjectId(
    projectId: string,
  ): Promise<ProjectColumn[] | null> {
    return await this.repo.find({
      where: {
        projectId: projectId,
      },
      relations: ["tasks"],
      order: { order: "ASC" },
    });
  }

  /**
   * Finds a column by project ID and title.
   * @param projectId - Project ID
   * @param title - Column title
   * @returns ProjectColumn or null
   */
  public async findByProjectIdAndTitle(
    projectId: string,
    title: string,
  ): Promise<ProjectColumn | null> {
    return await this.repo.findOne({
      where: {
        projectId: projectId,
        title: title,
      },
    });
  }

  /**
   * Finds a column by its ID.
   * @param columnId - Column ID
   * @returns ProjectColumn or null
   */
  public async findById(columnId: string): Promise<ProjectColumn | null> {
    return await this.repo.findOneBy({
      id: columnId,
    });
  }

  /**
   * Deletes a column from a project by title.
   * @param projectId - Project ID
   * @param title - Column title
   * @returns DeleteResult
   */
  public async delete(projectId: string, title: string): Promise<DeleteResult> {
    return await this.repo.delete({
      title: title,
      projectId: projectId,
    });
  }

  /**
   * Reorders columns in a project when a column changes its order.
   * Adjusts orders of other columns to maintain sequence.
   * @param projectId - Project ID
   * @param oldOrder - Original column order
   * @param newOrder - New column order
   * @param columnId - Column ID being moved
   */
  async reorderColumns(
    projectId: string,
    oldOrder: number,
    newOrder: number,
    columnId: string,
  ): Promise<void> {
    if (newOrder > oldOrder) {
      await this.repo
        .createQueryBuilder()
        .update(ProjectColumn)
        .set({ order: () => `"order" - 1` })
        .where(`"projectId" = :projectId`, { projectId })
        .andWhere(`"order" > :oldOrder AND "order" <= :newOrder`, {
          oldOrder,
          newOrder,
        })
        .andWhere(`id != :columnId`, { columnId })
        .execute();
    } else {
      await this.repo
        .createQueryBuilder()
        .update(ProjectColumn)
        .set({ order: () => `"order" + 1` })
        .where(`"projectId" = :projectId`, { projectId })
        .andWhere(`"order" >= :newOrder AND "order" < :oldOrder`, {
          oldOrder,
          newOrder,
        })
        .andWhere(`id != :columnId`, { columnId })
        .execute();
    }
  }
}
