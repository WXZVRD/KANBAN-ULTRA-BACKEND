import { Body, Controller, Post } from '@nestjs/common';
import { TaskService } from './service/task.service';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { Task } from './entity/task.entity';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Authorized } from '../../auth/decorators/authorized.decorator';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('create')
  @Authorization()
  public async create(
    @Body() dto: CreateTaskDTO,
    @Authorized('id') id: string,
  ): Promise<Task> {
    return this.taskService.create(dto, id);
  }
}
