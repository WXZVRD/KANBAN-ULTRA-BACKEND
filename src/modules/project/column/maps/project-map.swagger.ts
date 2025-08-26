import { DeleteResult } from "typeorm";
import { SwaggerMap } from "../../../../libs/common/types/swagger-map.type";
import { ProjectColumnController } from "../column.controller";
import { ProjectColumn } from "../entity/column.entity";
import { CreateColumnDTO } from "../dto/create-column.dto";
import { UpdateColumnDTO } from "../dto/update-column.dto";
import { MoveColumnDTO } from "../dto/move-column.dto";

/*export const ColumnMapSwagger: SwaggerMap<ProjectColumnController> = {
  newOne: {
    summary: "Create a new project column",
    okDescription: "Column created successfully",
    okType: ProjectColumn,
    bodyType: CreateColumnDTO,
  },

  getByProjectId: {
    summary: "Get all columns for a project",
    okDescription: "Columns fetched successfully",
    okType: [ProjectColumn],
  },
};*/
