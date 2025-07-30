import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
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

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.MEMBER)
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
  public async getAll(): Promise<Task[]> {
    return this.taskService.getAll();
  }

  @Post('getById')
  @Authorization()
  public async getById(@Param('id') id: string): Promise<Task> {
    return this.taskService.getById(id);
  }
}
