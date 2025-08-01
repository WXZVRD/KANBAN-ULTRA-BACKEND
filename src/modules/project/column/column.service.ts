import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProjectColumnRepository } from './repository/column.repository';
import { ProjectColumn } from './entity/column.entity';
import { Project } from '../entity/project.entity';
import { CreateColumnDTO } from './dto/create-column.dto';
import { UpdateColumnDTO } from './dto/update-column.dto';
import { MoveColumnDTO } from './dto/move-column.dto';
import { DeleteResult } from 'typeorm';

interface IProjectColumnService {
  createDefaultColumns(project: Project): Promise<ProjectColumn[]>;
  createNewColumn(dto: CreateColumnDTO): Promise<ProjectColumn>;
  findByProjectId(projectId: string): Promise<ProjectColumn[]>;
  update(columnId: string, dto: UpdateColumnDTO): Promise<ProjectColumn>;
  moveColumn(columnId: string, dto: MoveColumnDTO): Promise<ProjectColumn>;
  delete(columnId: string): Promise<DeleteResult>;
}

@Injectable()
export class ProjectColumnService implements IProjectColumnService {
  private readonly logger = new Logger(ProjectColumnService.name);

  public constructor(
    private readonly projectColumnRepository: ProjectColumnRepository,
  ) {}

  public async createDefaultColumns(
    project: Project,
  ): Promise<ProjectColumn[]> {
    const defaultTitles: string[] = ['To Do', 'In Progress', 'Done'];

    this.logger.log(`Создание стандартных колонок для проекта: ${project.id}`);

    const createdColumns = await Promise.all(
      defaultTitles.map((title: string, index: number) =>
        this.projectColumnRepository.createAndSave({
          projectId: project.id,
          title,
          order: index,
        }),
      ),
    );

    this.logger.log(
      `Колонки созданы: ${createdColumns.map((c) => c.title).join(', ')}`,
    );

    return createdColumns;
  }

  public async createNewColumn(dto: CreateColumnDTO): Promise<ProjectColumn> {
    this.logger.debug(
      `Создание новой колонки: title="${dto.title}", order=${dto.order}, projectId=${dto.projectId}`,
    );

    const isSameColumn: ProjectColumn | null =
      await this.projectColumnRepository.findByTitleOrOrder(
        dto.title,
        dto.order,
        dto.projectId,
      );

    if (isSameColumn) {
      this.logger.warn(
        `Колонка с названием "${dto.title}" или позицией "${dto.order}" уже существует в проекте ID=${dto.projectId}`,
      );
      throw new ConflictException(
        'Колонка с таким названием или позицией уже существует.',
      );
    }

    const newColumn: ProjectColumn =
      await this.projectColumnRepository.createAndSave({
        projectId: dto.projectId,
        title: dto.title,
        order: dto.order,
      });

    this.logger.log(
      `Колонка успешно создана: id=${newColumn.id}, title="${newColumn.title}", projectId=${newColumn.projectId}`,
    );

    return newColumn;
  }

  public async findByProjectId(projectId: string): Promise<ProjectColumn[]> {
    const columns: ProjectColumn[] | null =
      await this.projectColumnRepository.findByProjectId(projectId);

    if (!columns || columns.length === 0) {
      throw new NotFoundException(
        `В данный момент у прроекта ${projectId} нету колоноу.`,
      );
    }

    return columns;
  }

  public async update(
    columnId: string,
    dto: UpdateColumnDTO,
  ): Promise<ProjectColumn> {
    const column: ProjectColumn | null =
      await this.projectColumnRepository.findById(columnId);

    if (!column) {
      throw new NotFoundException(`Такой колонки в проекте не существует!`);
    }

    Object.assign(column, dto);

    return this.projectColumnRepository.save(column);
  }

  public async moveColumn(
    columnId: string,
    dto: MoveColumnDTO,
  ): Promise<ProjectColumn> {
    const column: ProjectColumn | null =
      await this.projectColumnRepository.findById(columnId);

    if (!column) {
      throw new NotFoundException(`Такой колонки в проекте не существует!`);
    }

    Object.assign(column, dto);

    return this.projectColumnRepository.save(column);
  }

  public async delete(columnId: string): Promise<DeleteResult> {
    const column: ProjectColumn | null =
      await this.projectColumnRepository.findById(columnId);

    if (!column) {
      throw new NotFoundException(`Такой колонки в проекте не существует!`);
    }

    return this.projectColumnRepository.delete(column.id);
  }
}
