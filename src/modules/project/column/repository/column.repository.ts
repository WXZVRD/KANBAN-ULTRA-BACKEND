import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Project } from "../../entity/project.entity";
import { DeepPartial, DeleteResult, Repository } from "typeorm";
import { ProjectColumn } from "../entity/column.entity";

@Injectable()
export class ProjectColumnRepository {
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
}
