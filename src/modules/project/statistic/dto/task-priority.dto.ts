import { TaskPriority } from "../../task";

export interface TaskPriorityDTO {
  priority: TaskPriority;
  count: number;
  percent: number;
}
