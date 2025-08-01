import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRepository } from '../repository/project.repository';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectColumnService } from '../column/column.service';
import { Project } from '../entity/project.entity';
import { ProjectColumn } from '../column/entity/column.entity';
import { MembershipService } from '../membership/services/membership.service';
import { MemberRole } from '../membership/types/member-role.enum';
import { UpdateProjectDTO } from '../dto/update-project.dto';
import { DeleteResult } from 'typeorm';

export interface IProjectService {
  create(dto: CreateProjectDto, userId: string): Promise<Project>;
  getAll(): Promise<Project[]>;
  getByUser(userId: string): Promise<Project[]>;
  getById(projectId: string): Promise<Project>;
  updateById(projectId: string, dto: UpdateProjectDTO): Promise<Project>;
  deleteById(projectId: string): Promise<DeleteResult>;
}

@Injectable()
export class ProjectService implements IProjectService {
  private readonly logger: Logger = new Logger(ProjectService.name);

  public constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectColumnService: ProjectColumnService,
    private readonly membershipService: MembershipService,
  ) {}

  /**
   * Creates a new project for the specified user.
   *
   * Checks if a project with the same title already exists.
   * Automatically assigns the creator as an ADMIN member
   * and generates default project columns.
   *
   * @param dto - DTO containing project creation data
   * @param userId - ID of the user creating the project
   * @returns The newly created project entity
   * @throws ConflictException if a project with the same title already exists
   */
  public async create(dto: CreateProjectDto, userId: string): Promise<Project> {
    this.logger.log(
      `Creating project with title: "${dto.title}" for user: ${userId}`,
    );

    const isSameNameExits: Project | null =
      await this.projectRepository.findByTitle(dto.title);

    if (isSameNameExits) {
      this.logger.warn(`Project with title "${dto.title}" already exists`);
      throw new ConflictException('A project with this title already exists.');
    }

    this.logger.log('No project with the same title found, creating a new one');

    const newProject: Project = await this.projectRepository.create({
      title: dto.title,
      accessType: dto.accessType,
      ownerId: userId,
    });

    this.logger.log(`Project created: ${JSON.stringify(newProject)}`);

    const savedProject: Project = await this.projectRepository.save(newProject);

    this.logger.log(
      `Project successfully saved without columns. Project ID: ${savedProject.id}`,
    );

    await this.membershipService.createNewMember({
      memberRole: MemberRole.ADMIN,
      projectId: savedProject.id,
      userId: userId,
    });

    this.logger.log(`Project creator assigned as ADMIN member`);

    const newProjectColumns: ProjectColumn[] =
      await this.projectColumnService.createDefaultColumns(savedProject);

    this.logger.log(
      `Columns created for project: ${newProjectColumns.map((c) => c.title).join(', ')}`,
    );

    savedProject.columns = newProjectColumns;

    this.logger.log(
      `Project successfully saved with columns. Project ID: ${savedProject.id}`,
    );

    return await this.projectRepository.save(savedProject);
  }

  /**
   * Retrieves all projects from the database.
   *
   * @returns An array of all projects
   * @throws NotFoundException if there are no projects
   */
  public async getAll(): Promise<Project[]> {
    const projects: Project[] | null = await this.projectRepository.findAll();

    if (!projects || !projects.length) {
      this.logger.warn(`No projects found, please create at least one`);
      throw new NotFoundException(
        'No projects found, please create at least one.',
      );
    }

    return projects;
  }

  /**
   * Retrieves all projects owned by a specific user.
   *
   * @param userId - ID of the user
   * @returns Array of projects owned by the user
   * @throws NotFoundException if the user has no projects
   */
  public async getByUser(userId: string): Promise<Project[]> {
    const projects: Project[] | null =
      await this.projectRepository.findByUserId(userId);

    if (!projects || !projects.length) {
      this.logger.warn(
        `User with id ${userId} has no projects, please create at least one`,
      );
      throw new NotFoundException(
        `User with id ${userId} has no projects, please create at least one.`,
      );
    }

    return projects;
  }

  /**
   * Retrieves a project by its ID.
   *
   * @param projectId - The ID of the project
   * @returns The project entity
   * @throws NotFoundException if the project does not exist
   */
  public async getById(projectId: string): Promise<Project> {
    const project: Project | null =
      await this.projectRepository.findById(projectId);

    if (!project) {
      this.logger.warn(`Project with id: ${projectId} does not exist!`);
      throw new NotFoundException(
        `Project with id: ${projectId} does not exist!`,
      );
    }

    return project;
  }

  /**
   * Updates a project by its ID.
   *
   * @param projectId - The ID of the project to update
   * @param dto - DTO containing fields to update
   * @returns The updated project entity
   * @throws NotFoundException if the project does not exist
   */
  public async updateById(
    projectId: string,
    dto: UpdateProjectDTO,
  ): Promise<Project> {
    const project: Project | null =
      await this.projectRepository.findById(projectId);

    if (!project) {
      this.logger.warn(`Project with id: ${projectId} does not exist!`);
      throw new NotFoundException(
        `Project with id: ${projectId} does not exist!`,
      );
    }

    Object.assign(project, dto);

    return await this.projectRepository.save(project);
  }

  /**
   * Deletes a project by its ID.
   *
   * @param projectId - The ID of the project to delete
   * @returns The result of the delete operation
   * @throws NotFoundException if the project does not exist
   */
  public async deleteById(projectId: string): Promise<DeleteResult> {
    const project: Project | null =
      await this.projectRepository.findById(projectId);

    if (!project) {
      this.logger.warn(`Project with id: ${projectId} does not exist!`);
      throw new NotFoundException(
        `Project with id: ${projectId} does not exist!`,
      );
    }

    return await this.projectRepository.deleteById(project.id);
  }
}
