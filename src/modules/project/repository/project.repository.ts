import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../entity/project.entity';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';

export interface IProjectRepository {
  create(projectToCreate: DeepPartial<Project>): Promise<Project>;
  save(projectToSave: Project): Promise<Project>;
  createAndSave(projectToSave: Project): Promise<Project>;
  findByTitle(title: string): Promise<Project | null>;
  findAll(): Promise<Project[] | null>;
  findByUserId(userId: string): Promise<Project[] | null>;
  findById(projectId: string): Promise<Project | null>;
  deleteById(projectId: string): Promise<DeleteResult>;
}

@Injectable()
export class ProjectRepository implements IProjectRepository {
  public constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
  ) {}

  public async create(projectToCreate: DeepPartial<Project>): Promise<Project> {
    return this.repo.create(projectToCreate);
  }

  public async save(projectToSave: Project): Promise<Project> {
    return this.repo.save(projectToSave);
  }

  public async createAndSave(projectToSave: Project): Promise<Project> {
    const createdProject: Project = this.repo.create(projectToSave);

    return this.repo.save(createdProject);
  }

  public async findByTitle(title: string): Promise<Project | null> {
    return await this.repo.findOne({ where: { title: title } });
  }

  public async findAll(): Promise<Project[] | null> {
    return await this.repo.find();
  }

  public async findByUserId(userId: string): Promise<Project[] | null> {
    return await this.repo.findBy({ ownerId: userId });
  }

  public async findById(projectId: string): Promise<Project | null> {
    return await this.repo.findOne({ where: { id: projectId } });
  }

  public async deleteById(projectId: string): Promise<DeleteResult> {
    return await this.repo.delete({ id: projectId });
  }
}
