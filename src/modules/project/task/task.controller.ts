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
import { DeleteResult } from 'typeorm';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TaskService } from './service/task.service';
import { MembershipAccessControlGuard } from '../membership/guards/member-access-control.guard';
import { MemberRole } from '../membership/types/member-role.enum';
import { MembershipRoles } from '../membership/decorators/membership.decorator';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { CreateTaskDTO } from './dto/create-task.dto';
import { Authorized } from '../../auth/decorators/authorized.decorator';
import { Task } from './entity/task.entity';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { ApiAuthEndpoint } from '../../../libs/common/decorators/api-swagger-simpli.decorator';
import { TaskMapSwagger } from './maps/task-map.swagger';
import { TaskFilterDto } from './dto/task-filter.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('project/:projectId/task')
export class TaskController {
  private readonly logger: Logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  /**
   * Creates a new task for the specified project.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
  @Post('create')
  @Authorization()
  @ApiAuthEndpoint(TaskMapSwagger.create)
  public async create(
    @Body() dto: CreateTaskDTO,
    @Authorized('id') id: string,
  ): Promise<Task> {
    this.logger.log(`POST /create | UserId=${id} | DTO=${JSON.stringify(dto)}`);
    const task: Task = await this.taskService.create(dto, id);
    this.logger.log(`Task created with ID=${task.id}`);
    return task;
  }

  /**
   * Updates an existing task.
   */
  @Patch('update')
  @Authorization()
  @ApiAuthEndpoint(TaskMapSwagger.update)
  public async update(@Body() dto: UpdateTaskDTO): Promise<Task> {
    this.logger.log(`PATCH /update | DTO=${JSON.stringify(dto)}`);
    const task: Task = await this.taskService.update(dto);
    this.logger.log(`Task updated ID=${task.id}`);
    return task;
  }

  /**
   * Retrieves all tasks.
   */
  @Post('getAll')
  @Authorization()
  @ApiAuthEndpoint(TaskMapSwagger.getAll)
  public async getAll(): Promise<Task[]> {
    this.logger.log('POST /getAll | Fetching all tasks');
    const tasks: Task[] = await this.taskService.getAll();
    this.logger.log(`Returned ${tasks.length} tasks`);
    return tasks;
  }

  /**
   * Retrieves a task by its ID.
   */
  @Post('getById')
  @Authorization()
  @ApiAuthEndpoint(TaskMapSwagger.getById)
  public async getById(@Param('id') id: string): Promise<Task> {
    this.logger.log(`POST /getById | TaskID=${id}`);
    const task: Task = await this.taskService.getById(id);
    this.logger.log(`Returned task: ${task?.id || 'NOT FOUND'}`);
    return task;
  }

  /**
   * Retrieves all tasks for a specific project with optional filters.
   */
  @Get('getByProjectId')
  @Authorization()
  @ApiAuthEndpoint(TaskMapSwagger.getTasksByProjectId)
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

  /**
   * Deletes a task by its ID.
   */
  @Delete('/:taskId')
  @Authorization()
  @ApiAuthEndpoint(TaskMapSwagger.deleteTask)
  public async deleteTask(
    @Param('taskId') taskId: string,
  ): Promise<DeleteResult> {
    this.logger.log(`DELETE /:taskId | TaskID=${taskId}`);
    const res: DeleteResult = await this.taskService.delete(taskId);

    return res;
  }
}
