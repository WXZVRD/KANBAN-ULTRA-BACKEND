import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { TaskService } from './service/task.service';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { Task } from './entity/task.entity';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Authorized } from '../../auth/decorators/authorized.decorator';
import { UpdateTaskDTO } from './dto/update-task.dto';

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

  @Patch('update')
  @Authorization()
  public async update(@Body() dto: UpdateTaskDTO): Promise<Task> {
    return this.taskService.update(dto);
  }

  @Post('getAll')
  @Authorization()
  public async getAll(@Body() dto: UpdateTaskDTO): Promise<void> {}

  @Post('getById')
  @Authorization()
  public async getById(@Param('id') id: string): Promise<void> {}
}
