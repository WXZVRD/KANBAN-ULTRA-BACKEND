import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class DeleteColumnDTO {
  @IsNotEmpty({ message: "Название колонки (title) обязательно." })
  @IsString({ message: "Название колонки должно быть строкой." })
  title: string;
}
