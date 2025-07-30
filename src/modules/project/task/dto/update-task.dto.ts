import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsEnum,
  IsDateString,
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

/*"columnId": "b7cb5b78-7a2a-49b7-82ac-1cf07158c32c",
    "projectId": "58b24dbb-3156-4e1c-99a0-7ec44f067969",
    "assigneeId": "a8b40e50-5a2c-405c-a417-e3651a3a509b",
    "priority": "medium"*/
