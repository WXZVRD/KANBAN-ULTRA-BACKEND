import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../types/priority.enum';

export class UpdateTaskDTO {
  @ApiProperty({
    example: 't1u2v3w4-uuid-task-id',
    description: 'ID of the task to be updated',
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiPropertyOptional({
    example: 'Fix JWT authentication bug',
    description: 'Updated title of the task',
  })
  @IsOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Fix the token refresh flow for JWT authentication',
    description: 'Detailed description of the task',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-uuid-column-id',
    description: 'Move the task to a different column',
  })
  @IsOptional()
  @IsUUID()
  columnId: string;

  @ApiPropertyOptional({
    example: 'u1v2w3x4-uuid-assignee-id',
    description: 'Reassign the task to another user',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.LOW,
    description: 'Update the task priority',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
