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
import { TaskService } from '@/modules/project/task/service/task.service';
import { MembershipAccessControlGuard } from '@/modules/project/membership/guards/member-access-control.guard';
import { MemberRole } from '@/modules/project/membership/types/member-role.enum';
import { MembershipRoles } from '@/modules/project/membership/decorators/membership.decorator';
import { Authorization } from '@/modules/auth/decorators/auth.decorator';
import { CreateTaskDTO } from '@/modules/project/task/dto/create-task.dto';
import { Authorized } from '@/modules/auth/decorators/authorized.decorator';
import { Task } from '@/modules/project/task/entity/task.entity';
import { UpdateTaskDTO } from '@/modules/project/task/dto/update-task.dto';
import { TaskFilterDto } from '@/modules/project/task/dto/task-filter.dto';

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
  @ApiOperation({ summary: 'Create a new task in a project' })
  @ApiOkResponse({ description: 'Task successfully created', type: Task })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Access denied to this project' })
  @ApiBody({ type: CreateTaskDTO })
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
  @ApiOperation({ summary: 'Update task by DTO' })
  @ApiOkResponse({ description: 'Task successfully updated', type: Task })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: UpdateTaskDTO })
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
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiOkResponse({ description: 'List of all tasks', type: [Task] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiOkResponse({ description: 'Task found', type: Task })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Task ID',
  })
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
  @ApiOperation({ summary: 'Get tasks by project ID with filters' })
  @ApiOkResponse({ description: 'List of project tasks', type: [Task] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  })
  @ApiQuery({ name: 'assigneeId', required: false, type: String })
  @ApiParam({ name: 'projectId', type: String, required: true })
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
  @ApiOperation({ summary: 'Delete task by ID' })
  @ApiOkResponse({
    description: 'Task successfully deleted',
    type: DeleteResult,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiParam({ name: 'taskId', type: String, required: true })
  public async deleteTask(
    @Param('taskId') taskId: string,
  ): Promise<DeleteResult> {
    this.logger.log(`DELETE /:taskId | TaskID=${taskId}`);
    const res: DeleteResult = await this.taskService.delete(taskId);

    return res;
  }
}
