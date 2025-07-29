import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../entity/project.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class ProjectRepository {
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
}
