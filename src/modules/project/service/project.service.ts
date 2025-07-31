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

@Injectable()
export class ProjectService {
  private readonly logger: Logger = new Logger(ProjectService.name);

  public constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectColumnService: ProjectColumnService,
    private readonly membershipService: MembershipService,
  ) {}

  public async create(dto: CreateProjectDto, userId: string): Promise<any> {
    this.logger.log(
      `Создание проекта с названием: "${dto.title}" для пользователя: ${userId}`,
    );

    const isSameNameExits: Project | null =
      await this.projectRepository.findByTitle(dto.title);

    if (isSameNameExits) {
      this.logger.warn(`Проект с названием "${dto.title}" уже существует`);
      throw new ConflictException('Проект с таким названием уже существует.');
    }

    this.logger.log('Проект с таким названием не найден, создаем новый');

    const newProject: Project = await this.projectRepository.create({
      title: dto.title,
      accessType: dto.accessType,
      ownerId: userId,
    });

    this.logger.log(`Проект создан: ${JSON.stringify(newProject)}`);

    const savedProject: Project = await this.projectRepository.save(newProject);

    this.logger.log(
      `Проект успешно сохранен без колонок. ID проекта: ${savedProject.id}`,
    );

    await this.membershipService.createNewMember({
      memberRole: MemberRole.ADMIN,
      projectId: savedProject.id,
      userId: userId,
    });

    this.logger.log(`Создателю проекта присвоено членство как АДМИНИСТРАТОР`);

    const newProjectColumns: ProjectColumn[] =
      await this.projectColumnService.createDefaultColumns(savedProject);

    this.logger.log(
      `Созданы колонки для проекта: ${newProjectColumns.map((c) => c.title).join(', ')}`,
    );

    savedProject.columns = newProjectColumns;

    this.logger.log(
      `Проект успешно сохранен с колонками. ID проекта: ${savedProject.id}`,
    );

    return await this.projectRepository.save(savedProject);
  }

  public async getAll(): Promise<Project[]> {
    const projects: Project[] | null = await this.projectRepository.findAll();

    if (!projects || !projects.length) {
      this.logger.warn(`Проектов нету, пожалуйста создайте хотя бы один`);
      throw new NotFoundException(
        'Проектов нету, пожалуйста создайте хотя бы один.',
      );
    }

    return projects;
  }

  public async getByUser(userId: string): Promise<Project[]> {
    const projects: Project[] | null =
      await this.projectRepository.findByUserId(userId);

    if (!projects || !projects.length) {
      this.logger.warn(
        `У пользователя с id ${userId} проектов нету, пожалуйста создайте хотя бы один`,
      );
      throw new NotFoundException(
        `У пользователя с id ${userId} проектов нету, пожалуйста создайте хотя бы один.`,
      );
    }

    return projects;
  }

  public async getById(projectId: string): Promise<Project> {
    const project: Project | null =
      await this.projectRepository.findById(projectId);

    if (!project) {
      this.logger.warn(`Проекта с id:  ${projectId} не существует!`);
      throw new NotFoundException(`Проекта с id:  ${projectId} не существует!`);
    }

    return project;
  }

  public async updateById(
    projectId: string,
    dto: UpdateProjectDTO,
  ): Promise<Project> {
    const project: Project | null =
      await this.projectRepository.findById(projectId);

    if (!project) {
      this.logger.warn(`Проекта с id:  ${projectId} не существует!`);
      throw new NotFoundException(`Проекта с id:  ${projectId} не существует!`);
    }

    Object.assign(project, dto);

    return await this.projectRepository.save(project);
  }
}
