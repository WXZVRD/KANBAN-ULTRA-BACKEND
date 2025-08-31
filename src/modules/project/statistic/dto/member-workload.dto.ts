export interface MemberWorkloadDTO {
  assignee: {
    id: string;
    picture: string;
    displayName: string;
  } | null;
  taskCount: number;
  percent: number;
}
