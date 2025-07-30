import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Task } from '../entity/task.entity';

@Injectable()
export class TaskRepository {
  public constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  public async create(taskToCreate: DeepPartial<Task>): Promise<Task> {
    return this.repo.create(taskToCreate);
  }

  public async save(taskToSave: Task): Promise<Task> {
    return this.repo.save(taskToSave);
  }

  public async createAndSave(taskToSave: DeepPartial<Task>): Promise<Task> {
    const createdTask: Task = this.repo.create(taskToSave);

    return this.repo.save(createdTask);
  }

  public async findById(id: string): Promise<Task | null> {
    return this.repo.findOne({
      where: { id },
    });
  }
}
