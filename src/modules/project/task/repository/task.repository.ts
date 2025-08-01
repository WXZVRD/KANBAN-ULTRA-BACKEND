import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Task, TaskFilterDto } from '../index';

interface ITaskRepository {
  create(taskToCreate: DeepPartial<Task>): Promise<Task>;
  save(taskToSave: Task): Promise<Task>;
  createAndSave(taskToSave: DeepPartial<Task>): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  getAll(): Promise<Task[] | null>;
  findByProjectId(projectId: string, filter?: TaskFilterDto): Promise<Task[]>;
}

@Injectable()
export class TaskRepository implements ITaskRepository {
  public constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  /** Creates a new Task instance (does not save to DB). */
  public async create(taskToCreate: DeepPartial<Task>): Promise<Task> {
    return this.repo.create(taskToCreate);
  }

  /** Saves an existing Task entity to the database. */
  public async save(taskToSave: Task): Promise<Task> {
    return this.repo.save(taskToSave);
  }

  /** Creates and immediately saves a new Task entity. */
  public async createAndSave(taskToSave: DeepPartial<Task>): Promise<Task> {
    const createdTask: Task = this.repo.create(taskToSave);
    return this.repo.save(createdTask);
  }

  /** Finds a task by its ID. */
  public async findById(id: string): Promise<Task | null> {
    return this.repo.findOne({
      where: { id },
    });
  }

  /** Retrieves all tasks. */
  public async getAll(): Promise<Task[] | null> {
    return this.repo.find();
  }

  /**
   * Finds all tasks for a given project with optional filters.
   *
   * @param projectId - Project ID
   * @param filter - Optional filters (priority, assigneeId)
   */
  public async findByProjectId(
    projectId: string,
    filter: TaskFilterDto,
  ): Promise<Task[]> {
    const qb: SelectQueryBuilder<Task> = this.repo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.author', 'author')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.column', 'column')
      .where('task.projectId = :projectId', { projectId });

    if (filter.priority) {
      qb.andWhere('task.priority = :priority', { priority: filter.priority });
    }

    if (filter.assigneeId === null) {
      qb.andWhere('task.assigneeId IS NULL');
    } else if (filter.assigneeId) {
      qb.andWhere('task.assigneeId = :assigneeId', {
        assigneeId: filter.assigneeId,
      });
    }

    qb.orderBy('task.createdAt', 'DESC');

    return qb.getMany();
  }

  /** Deletes a task by its ID. */
  public async delete(id: string): Promise<DeleteResult> {
    return this.repo.delete({ id: id });
  }
}
