export interface MetricCollector<T> {
  collect(projectId: string): Promise<T>;
}
