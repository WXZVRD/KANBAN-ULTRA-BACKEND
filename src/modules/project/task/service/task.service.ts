import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import {
  CreateTaskDTO,
  Task,
  TaskFilterDto,
  TaskRepository,
  UpdateTaskDTO,
} from '../index';

interface ITaskService {
  create(dto: CreateTaskDTO, id: string): Promise<Task>;
  update(dto: UpdateTaskDTO): Promise<Task>;
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task>;
}

@Injectable()
export class TaskService implements ITaskService {
  private readonly logger: Logger = new Logger(TaskService.name);

  public constructor(private readonly taskRepository: TaskRepository) {}

  /**
   * Creates a new task and saves it to the database.
   *
   * @param dto - DTO with task creation data
   * @param id - Author (user) ID
   * @returns The created task entity
   */
  public async create(dto: CreateTaskDTO, id: string): Promise<Task> {
    const task: Task = await this.taskRepository.create({
      title: dto.title,
      authorId: id,
      projectId: dto.projectId,
      columnId: dto.columnId,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
    });

    return this.taskRepository.save(task);
  }

  /**
   * Updates an existing task.
   *
   * @param dto - DTO containing updated fields
   * @returns Updated task entity
   * @throws NotFoundException if task does not exist
   */
  public async update(dto: UpdateTaskDTO): Promise<Task> {
    this.logger.log(`Request to update task with ID: ${dto.id}`);

    const task: Task | null = await this.taskRepository.findById(dto.id);

    if (!task) {
      this.logger.warn(`Task with ID ${dto.id} not found`);
      throw new NotFoundException(
        `Task with ID ${dto.id} was not found. Please check the provided ID.`,
      );
    }

    this.logger.debug(`Original task: ${JSON.stringify(task)}`);
    this.logger.debug(`Update data: ${JSON.stringify(dto)}`);

    Object.assign(task, dto);

    const updated: Task = await this.taskRepository.save(task);

    this.logger.log(`Task with ID ${updated.id} successfully updated.`);
    return updated;
  }

  /**
   * Retrieves all tasks from the database.
   *
   * @returns Array of all tasks
   * @throws NotFoundException if there are no tasks
   */
  public async getAll(): Promise<Task[]> {
    const tasks: Task[] | null = await this.taskRepository.getAll();

    if (!tasks || tasks.length === 0) {
      this.logger.warn(`No tasks found`);
      throw new NotFoundException(
        `No tasks exist, please create at least one task.`,
      );
    }

    return tasks;
  }

  /**
   * Retrieves a task by its ID.
   *
   * @param id - Task ID
   * @returns Task entity if found
   * @throws NotFoundException if task does not exist
   */
  public async getById(id: string): Promise<Task> {
    const task: Task | null = await this.taskRepository.findById(id);

    if (!task) {
      this.logger.warn(`Task with ID ${id} not found`);
      throw new NotFoundException(
        `Task with ID ${id} was not found. Please check the provided ID.`,
      );
    }

    return task;
  }

  /**
   * Deletes a task by its ID.
   *
   * @param taskId - Task ID
   * @returns DeleteResult
   */
  public async delete(taskId: string): Promise<DeleteResult> {
    return this.taskRepository.delete(taskId);
  }

  /**
   * Finds all tasks for a given project, optionally filtered.
   *
   * @param projectId - Project ID
   * @param filter - Optional filters (priority, assignee)
   * @returns Array of tasks
   * @throws NotFoundException if no tasks are found for the project
   */
  public async findProjectTask(
    projectId: string,
    filter: TaskFilterDto,
  ): Promise<Task[]> {
    const tasks: Task[] | null = await this.taskRepository.findByProjectId(
      projectId,
      filter,
    );

    if (!tasks) {
      this.logger.warn(`Tasks for project ${projectId} were not found.`);
      throw new NotFoundException(
        `Tasks for project ${projectId} were not found.`,
      );
    }

    return tasks;
  }
}
