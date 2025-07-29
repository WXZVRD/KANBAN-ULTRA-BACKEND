import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateColumnDTO {
  @IsNotEmpty({ message: 'Порядковый номер колонки (order) обязателен.' })
  @IsNumber({}, { message: 'Порядковый номер должен быть числом.' })
  order: number;

  @IsNotEmpty({ message: 'Название колонки (title) обязательно.' })
  @IsString({ message: 'Название колонки должно быть строкой.' })
  title: string;

  @IsNotEmpty({ message: 'ID проекта обязателен.' })
  @IsUUID(undefined, { message: 'ID проекта должен быть корректным UUID.' })
  projectId: string;
}
