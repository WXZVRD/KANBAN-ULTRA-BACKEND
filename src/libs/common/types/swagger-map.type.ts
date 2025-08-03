export type MethodsOf<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export interface SwaggerConfig {
  summary: string;
  okDescription: string;
  okType: any;
  bodyType?: any;
}

export type SwaggerMap<T> = {
  [K in MethodsOf<T>]: SwaggerConfig;
};
