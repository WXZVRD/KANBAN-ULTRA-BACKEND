import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Project } from "../entity/project.entity";
import { DeepPartial, DeleteResult, Repository } from "typeorm";

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

  /**
   * Creates a new Project entity instance (does not persist to DB).
   * @param projectToCreate Partial project data
   * @returns Project instance
   */
  public async create(projectToCreate: DeepPartial<Project>): Promise<Project> {
    return this.repo.create(projectToCreate);
  }

  /**
   * Saves a Project entity to the database.
   * @param projectToSave Project entity to save
   * @returns Saved Project entity
   */
  public async save(projectToSave: Project): Promise<Project> {
    return this.repo.save(projectToSave);
  }

  /**
   * Creates a new Project entity and immediately saves it to the database.
   * @param projectToSave Project entity to create and save
   * @returns Saved Project entity
   */
  public async createAndSave(projectToSave: Project): Promise<Project> {
    const createdProject: Project = this.repo.create(projectToSave);

    return this.repo.save(createdProject);
  }

  /**
   * Finds a project by its title.
   * @param title Title of the project
   * @returns Project entity or null if not found
   */
  public async findByTitle(title: string): Promise<Project | null> {
    return await this.repo.findOne({ where: { title: title } });
  }

  /**
   * Retrieves all projects.
   * @returns Array of Project entities or null
   */
  public async findAll(): Promise<Project[] | null> {
    return await this.repo.find();
  }

  /**
   * Retrieves all projects owned by a specific user.
   * @param userId ID of the user
   * @returns Array of Project entities or null
   */
  public async findByUserId(userId: string): Promise<Project[] | null> {
    return await this.repo.findBy({ ownerId: userId });
  }

  /**
   * Finds a project by its ID.
   * @param projectId Project ID
   * @returns Project entity or null if not found
   */
  public async findById(projectId: string): Promise<Project | null> {
    return await this.repo.findOne({ where: { id: projectId } });
  }

  /**
   * Deletes a project by its ID.
   * @param projectId Project ID
   * @returns DeleteResult object containing deletion status
   */
  public async deleteById(projectId: string): Promise<DeleteResult> {
    return await this.repo.delete({ id: projectId });
  }
}
