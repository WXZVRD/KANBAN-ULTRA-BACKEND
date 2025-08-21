import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { ITaskRepository } from '../repository/task.repository';
import { CreateTaskDTO, Task, TaskFilterDto, UpdateTaskDTO } from '../index';
import { IRedisService } from '../../../redis/redis.service';
import { RedisKey } from '../../../../libs/common/types/redis.types';
import ms from 'ms';
import { UpdateAssigneeDTO } from '../dto/update-assignee.dto';
import { IMailService } from '../../../mail/mail.service';
import { IUserService } from '../../../user/services/user.service';
import { User } from '../../../user/entity/user.entity';
import {
  TaskAssignedEmailData,
  TaskAssigneeEmail,
} from '../../../mail/templates/task-assignee/task-assignee.email';

export interface ITaskService {
  create(dto: CreateTaskDTO, id: string): Promise<Task>;
  update(dto: UpdateTaskDTO): Promise<Task>;
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task>;
  findProjectTask(projectId: string, filter: TaskFilterDto): Promise<Task[]>;
  updateAssignee(
    assigneeId: string,
    projectId: string,
    dto: UpdateAssigneeDTO,
  ): Promise<Task>;
  delete(taskId: string): Promise<DeleteResult>;
}

@Injectable()
export class TaskService implements ITaskService {
  private readonly logger: Logger = new Logger(TaskService.name);

  public constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IRedisService')
    private readonly redisService: IRedisService,
    @Inject('IMailService')
    private readonly mailService: IMailService,
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

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
   * Updates an existing task.
   *
   * @param assigneeId
   * @param projectId
   * @param dto - DTO containing updated fields
   * @returns Updated task entity
   * @throws NotFoundException if task does not exist
   */
  public async updateAssignee(
    assigneeId: string,
    projectId: string,
    dto: UpdateAssigneeDTO,
  ): Promise<Task> {
    this.logger.log(
      `Received request to update assignee for task ID: ${dto.taskId} → new assignee: ${assigneeId}`,
    );

    const task: Task | null = await this.taskRepository.findById(dto.taskId);

    if (!task) {
      this.logger.warn(
        `Task with ID ${dto.taskId} not found. Cannot reassign to user ${assigneeId}.`,
      );
      throw new NotFoundException(
        `Task with ID ${dto.taskId} was not found. Please check the provided ID.`,
      );
    }

    if (task.assigneeId === assigneeId) {
      this.logger.warn(
        `Task ${task.id} already assigned to user ${assigneeId}. Reassignment skipped.`,
      );
      throw new ConflictException(`Task is already assigned to this user.`);
    }

    this.logger.debug(
      `Original task state: ${JSON.stringify(
        { id: task.id, assigneeId: task.assigneeId },
        null,
        2,
      )}`,
    );

    task.assigneeId = assigneeId;

    const updated: Task = await this.taskRepository.save(task);

    this.logger.log(
      `Task with ID ${updated.id} successfully reassigned from ${
        task.assigneeId || 'unassigned'
      } → ${assigneeId}`,
    );

    this.logger.log(`Task with ID ${updated.id} successfully updated.`);

    const assigneeUser: User | null =
      await this.userService.findById(assigneeId);

    if (!assigneeUser) {
      this.logger.warn(`User with ID ${assigneeId} not found.`);
      throw new NotFoundException(
        `User with ID ${assigneeId} was not found. Please check the provided ID.`,
      );
    }

    await this.mailService.send<TaskAssignedEmailData>(
      assigneeUser.email,
      new TaskAssigneeEmail(),
      {
        projectId: projectId,
        taskId: assigneeId,
        taskTitle: updated.id,
      },
    );

    this.logger.log(
      `Sending task assignment email: "${updated.title}" to ${assigneeUser.email}`,
    );

    return updated;
  }

  /**
   * Retrieves all tasks from the database.
   *
   * @returns Array of all tasks
   * @throws NotFoundException if there are no tasks
   */
  public async getAll(): Promise<Task[]> {
    const cached: Task[] | null = await this.redisService.get(RedisKey.TaskAll);
    if (cached) return cached;

    const tasks: Task[] | null = await this.taskRepository.getAll();

    if (!tasks || tasks.length === 0) {
      this.logger.warn(`No tasks found`);
      throw new NotFoundException(
        `No tasks exist, please create at least one task.`,
      );
    }

    await this.redisService.set(RedisKey.TaskAll, tasks, ms('1m'));
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
    const cached: Task | null = await this.redisService.get(RedisKey.Task, id);
    if (cached) return cached;

    const task: Task | null = await this.taskRepository.findById(id);

    if (!task) {
      this.logger.warn(`Task with ID ${id} not found`);
      throw new NotFoundException(
        `Task with ID ${id} was not found. Please check the provided ID.`,
      );
    }

    await this.redisService.set(RedisKey.Task, task, ms('1m'), id);

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
    const cached: Task[] | null = await this.redisService.get(
      RedisKey.ProjectTasks,
      projectId,
    );
    if (cached) return cached;

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

    await this.redisService.set(
      RedisKey.ProjectTasks,
      tasks,
      ms('1m'),
      projectId,
    );

    return tasks;
  }
}
