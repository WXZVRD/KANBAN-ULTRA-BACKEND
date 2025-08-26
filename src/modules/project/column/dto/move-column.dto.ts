import { IsNotEmpty, IsNumber } from "class-validator";

export class MoveColumnDTO {
  @IsNotEmpty({ message: "Порядковый номер колонки (order) обязателен." })
  @IsNumber({}, { message: "Порядковый номер должен быть числом." })
  order: number;
}
