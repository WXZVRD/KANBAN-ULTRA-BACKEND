import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Project } from '../entity/project.entity';
import { CreateColumnDTO } from './dto/create-column.dto';
import { ProjectColumn } from './entity/column.entity';
import { UpdateColumnDTO } from './dto/update-column.dto';
import { MoveColumnDTO } from './dto/move-column.dto';
import { ProjectColumnRepository } from './repository/column.repository';

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
  private readonly logger: Logger = new Logger(ProjectColumnService.name);

  public constructor(
    private readonly projectColumnRepository: ProjectColumnRepository,
  ) {}

  /**
   * Creates default columns ("To Do", "In Progress", "Done") for a given project.
   * @param project The project to create columns for
   * @returns Array of created ProjectColumn entities
   */
  public async createDefaultColumns(
    project: Project,
  ): Promise<ProjectColumn[]> {
    const defaultTitles: string[] = ['To Do', 'In Progress', 'Done'];

    this.logger.log(`Creating default columns for project: ${project.id}`);

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
      `Columns created: ${createdColumns.map((c) => c.title).join(', ')}`,
    );

    return createdColumns;
  }

  /**
   * Creates a new project column if the title or order doesn't already exist.
   * @param dto CreateColumnDTO containing column title, order, and project ID
   * @throws ConflictException if column with the same title or order exists
   */
  public async createNewColumn(dto: CreateColumnDTO): Promise<ProjectColumn> {
    this.logger.debug(
      `Creating new column: title="${dto.title}", order=${dto.order}, projectId=${dto.projectId}`,
    );

    const isSameColumn: ProjectColumn | null =
      await this.projectColumnRepository.findByTitleOrOrder(
        dto.title,
        dto.order,
        dto.projectId,
      );

    if (isSameColumn) {
      this.logger.warn(
        `Column with title "${dto.title}" or order "${dto.order}" already exists in project ID=${dto.projectId}`,
      );
      throw new ConflictException(
        'A column with this title or order already exists.',
      );
    }

    const newColumn: ProjectColumn =
      await this.projectColumnRepository.createAndSave({
        projectId: dto.projectId,
        title: dto.title,
        order: dto.order,
      });

    this.logger.log(
      `Column successfully created: id=${newColumn.id}, title="${newColumn.title}", projectId=${newColumn.projectId}`,
    );

    return newColumn;
  }

  /**
   * Finds all columns for a given project.
   * @param projectId Project ID
   * @throws NotFoundException if no columns exist
   */
  public async findByProjectId(projectId: string): Promise<ProjectColumn[]> {
    const columns: ProjectColumn[] | null =
      await this.projectColumnRepository.findByProjectId(projectId);

    if (!columns || columns.length === 0) {
      throw new NotFoundException(
        `No columns currently exist for project ${projectId}.`,
      );
    }

    return columns;
  }

  /**
   * Updates an existing project column.
   * @param columnId ID of the column to update
   * @param dto UpdateColumnDTO with updated fields
   * @throws NotFoundException if column does not exist
   */
  public async update(
    columnId: string,
    dto: UpdateColumnDTO,
  ): Promise<ProjectColumn> {
    const column: ProjectColumn | null =
      await this.projectColumnRepository.findById(columnId);

    if (!column) {
      throw new NotFoundException(`This column does not exist in the project!`);
    }

    Object.assign(column, dto);

    return this.projectColumnRepository.save(column);
  }

  /**
   * Moves a column to a new order.
   * @param columnId Column ID
   * @param dto MoveColumnDTO containing the new order
   * @throws NotFoundException if column does not exist
   */
  public async moveColumn(
    columnId: string,
    dto: MoveColumnDTO,
  ): Promise<ProjectColumn> {
    const column: ProjectColumn | null =
      await this.projectColumnRepository.findById(columnId);

    if (!column) {
      throw new NotFoundException(`This column does not exist in the project!`);
    }

    Object.assign(column, dto);

    return this.projectColumnRepository.save(column);
  }

  /**
   * Deletes a column by ID.
   * @param columnId ID of the column to delete
   * @throws NotFoundException if column does not exist
   */
  public async delete(columnId: string): Promise<DeleteResult> {
    const column: ProjectColumn | null =
      await this.projectColumnRepository.findById(columnId);

    if (!column) {
      throw new NotFoundException(`This column does not exist in the project!`);
    }

    return this.projectColumnRepository.delete(column.id);
  }
}
