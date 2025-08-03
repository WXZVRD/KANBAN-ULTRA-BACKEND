import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../types/priority.enum';

export class CreateTaskDTO {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'Title of the task',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'a1b2c3d4-uuid-column-id',
    description: 'The ID of the column where the task will be created',
  })
  @IsNotEmpty()
  @IsUUID()
  columnId: string;

  @ApiProperty({
    example: 'p9q8r7s6-uuid-project-id',
    description: 'The ID of the project where the task belongs',
  })
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    example: 'u1v2w3x4-uuid-assignee-id',
    description: 'The ID of the user assigned to the task',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Priority of the task',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
