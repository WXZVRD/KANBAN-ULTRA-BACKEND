import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ProjectRepository } from '../repository/project.repository';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectColumnService } from '../column/column.service';
import { Project } from '../entity/project.entity';
import { ProjectColumn } from '../column/entity/column.entity';

@Injectable()
export class ProjectService {
  private readonly logger: Logger = new Logger(ProjectService.name);

  public constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectColumnService: ProjectColumnService,
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
}
