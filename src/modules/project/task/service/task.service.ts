import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../repository/task.repository';
import { CreateTaskDTO } from '../dto/create-task.dto';
import { Task } from '../entity/task.entity';

@Injectable()
export class TaskService {
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
}
