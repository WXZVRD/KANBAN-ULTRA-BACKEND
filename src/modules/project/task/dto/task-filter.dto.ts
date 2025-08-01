import { IsOptional, IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../types/priority.enum';
import { Transform } from 'class-transformer';

export class TaskFilterDto {
  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Filter tasks by priority',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: 'u1v2w3x4-uuid-assignee-id',
    description:
      'Filter tasks by assignee. Accepts UUID or null if unassigned.',
  })
  @IsOptional()
  @ValidateIf((o) => o.assigneeId !== null)
  @IsUUID('4', { message: 'assigneeId must be UUID or null' })
  @Transform(({ value }) => {
    if (value === '' || value === 'null') return null;
    return value;
  })
  assigneeId?: string | null;
}
