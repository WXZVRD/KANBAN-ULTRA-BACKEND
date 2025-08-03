import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../types/priority.enum';

export class UpdateAssigneeDTO {
  @ApiProperty({
    example: 'a1b2c3d4-uuid-column-id',
    description: 'The ID of the task',
  })
  @IsNotEmpty()
  @IsUUID()
  taskId: string;
}
