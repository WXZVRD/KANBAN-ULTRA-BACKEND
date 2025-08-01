import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './service/task.service';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { Task } from './entity/task.entity';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Authorized } from '../../auth/decorators/authorized.decorator';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { MembershipAccessControlGuard } from '../membership/guards/member-access-control.guard';
import { MembershipRoles } from '../membership/decorators/membership.decorator';
import { MemberRole } from '../membership/types/member-role.enum';
import { TaskFilterDto } from './dto/task-filter.dto';
import { DeleteResult } from 'typeorm';

@Controller('project/:projectId/task')
export class TaskController {
  private readonly logger: Logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Post('create')
  @Authorization()
  public async create(
    @Body() dto: CreateTaskDTO,
    @Authorized('id') id: string,
  ): Promise<Task> {
    this.logger.log(`POST /create | UserId=${id} | DTO=${JSON.stringify(dto)}`);
    const task: Task = await this.taskService.create(dto, id);
    this.logger.log(`Task created with ID=${task.id}`);
    return task;
  }

  @Patch('update')
  @Authorization()
  public async update(@Body() dto: UpdateTaskDTO): Promise<Task> {
    this.logger.log(`PATCH /update | DTO=${JSON.stringify(dto)}`);
    const task: Task = await this.taskService.update(dto);
    this.logger.log(`Task updated ID=${task.id}`);
    return task;
  }

  @Post('getAll')
  @Authorization()
  public async getAll(): Promise<Task[]> {
    this.logger.log('POST /getAll | Fetching all tasks');
    const tasks: Task[] = await this.taskService.getAll();
    this.logger.log(`Returned ${tasks.length} tasks`);
    return tasks;
  }

  @Post('getById')
  @Authorization()
  public async getById(@Param('id') id: string): Promise<Task> {
    this.logger.log(`POST /getById | TaskID=${id}`);
    const task: Task = await this.taskService.getById(id);
    this.logger.log(`Returned task: ${task?.id || 'NOT FOUND'}`);
    return task;
  }

  @Get('getByProjectId')
  @Authorization()
  public async getTasksByProjectId(
    @Param('projectId') projectId: string,
    @Query() filter: TaskFilterDto,
  ): Promise<Task[]> {
    this.logger.log(
      `GET /getByProjectId | ProjectID=${projectId} | Filter=${JSON.stringify(filter)}`,
    );
    const tasks: Task[] = await this.taskService.findProjectTask(
      projectId,
      filter,
    );
    this.logger.log(
      `Returned ${tasks.length} tasks for ProjectID=${projectId}`,
    );
    return tasks;
  }

  @Delete('/:taskId')
  @Authorization()
  public async deleteTask(
    @Param('taskId') taskId: string,
  ): Promise<DeleteResult> {
    this.logger.log(`Delete /:taskId  taskId=${taskId} `);
    const res: DeleteResult = await this.taskService.delete(taskId);

    return res;
  }
}
