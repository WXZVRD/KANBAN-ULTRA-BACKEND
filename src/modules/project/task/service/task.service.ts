import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '../repository/task.repository';
import { CreateTaskDTO } from '../dto/create-task.dto';
import { Task } from '../entity/task.entity';
import { UpdateTaskDTO } from '../dto/update-task.dto';
import { TaskFilterDto } from '../dto/task-filter.dto';
import { DeleteResult } from 'typeorm';

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

  public async update(dto: UpdateTaskDTO): Promise<Task> {
    this.logger.log(`Запрос на обновление задачи с id: ${dto.id}`);

    const task: Task | null = await this.taskRepository.findById(dto.id);

    if (!task) {
      this.logger.warn(`Задача с id ${dto.id} не найдена`);
      throw new NotFoundException(
        `Задача с id ${dto.id} не была найдена. Пожалуйста, проверьте введённый id.`,
      );
    }

    this.logger.debug(`Исходная задача: ${JSON.stringify(task)}`);
    this.logger.debug(`Данные для обновления: ${JSON.stringify(dto)}`);

    Object.assign(task, dto);

    const updated: Task = await this.taskRepository.save(task);

    this.logger.log(`Задача с id ${updated.id} успешно обновлена.`);
    return updated;
  }

  public async getAll(): Promise<Task[]> {
    const tasks: Task[] | null = await this.taskRepository.getAll();

    if (!tasks || tasks.length === 0) {
      this.logger.warn(`Нету задач`);
      throw new NotFoundException(
        `Задач не сущесвует, пожалуйста создайте хотя бы 1 задачу.`,
      );
    }

    return tasks;
  }

  public async getById(id: string): Promise<Task> {
    const task: Task | null = await this.taskRepository.findById(id);

    if (!task) {
      this.logger.warn(`Задача с id ${id} не найдена`);
      throw new NotFoundException(
        `Задача с id ${id} не была найдена. Пожалуйста, проверьте введённый id.`,
      );
    }

    return task;
  }

  public async delete(taskId: string): Promise<DeleteResult> {
    return this.taskRepository.delete(taskId);
  }

  public async findProjectTask(
    projectId: string,
    filter: TaskFilterDto,
  ): Promise<Task[]> {
    const tasks: Task[] | null = await this.taskRepository.findByProjectId(
      projectId,
      filter,
    );

    if (!tasks) {
      this.logger.warn(`Задачи для проекта ${projectId} не были найдены.`);
      throw new NotFoundException(
        `Задачи для проекта ${projectId} не были найдены.`,
      );
    }

    return tasks;
  }
}
