import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const getDbConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: configService.getOrThrow<string>("POSTGRES_HOST"),
  port: parseInt(configService.getOrThrow<string>("POSTGRES_PORT"), 10),
  username: configService.getOrThrow<string>("POSTGRES_USER"),
  password: configService.getOrThrow<string>("POSTGRES_PASSWORD"),
  database: configService.getOrThrow<string>("POSTGRES_DB"),
  synchronize: configService.get<string>("NODE_ENV") !== "production",
  logging: configService.get<string>("NODE_ENV") === "production",
  autoLoadEntities: true,
});
