export interface EmailTemplate<T> {
  subject: string;
  render(data: T): Promise<string>;
}
