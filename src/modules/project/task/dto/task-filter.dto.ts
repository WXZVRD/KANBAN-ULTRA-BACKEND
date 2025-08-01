import { IsOptional, IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { TaskPriority } from '../types/priority.enum';
import { Transform } from 'class-transformer';

export class TaskFilterDto {
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @ValidateIf((o) => o.assigneeId !== null)
  @IsUUID('4', { message: 'assigneeId должен быть UUID или null' })
  @Transform(({ value }) => {
    if (value === '' || value === 'null') return null;
    return value;
  })
  assigneeId?: string | null;
}
