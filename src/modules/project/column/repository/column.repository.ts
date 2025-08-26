import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Project } from "../../entity/project.entity";
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
      relations: ["tasks"],
      order: { order: "ASC" },
    });
  }

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

  public async findById(columnId: string): Promise<ProjectColumn | null> {
    return await this.repo.findOneBy({
      id: columnId,
    });
  }

  public async delete(projectId: string, title: string): Promise<DeleteResult> {
    return await this.repo.delete({
      title: title,
      projectId: projectId,
    });
  }

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
