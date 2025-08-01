import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { TaskPriority } from '../types/priority.enum';

export class UpdateTaskDTO {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  columnId: string;

  @IsOptional()
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
