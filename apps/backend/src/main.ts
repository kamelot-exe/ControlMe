import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import helmet from "helmet";

const logger = new Logger("Bootstrap");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === "production"
        ? ["error", "warn", "log"]
        : ["error", "warn", "log", "debug", "verbose"],
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT") ?? 3001;
  const trustProxy = configService.get<boolean>("TRUST_PROXY") ?? false;
  const allowedOrigins =
    configService
      .get<string>("ALLOWED_ORIGINS")
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? ["http://localhost:3000"];

  app.enableShutdownHooks();
  app.getHttpAdapter().getInstance().set("trust proxy", trustProxy);

  app.use(helmet());

  app.enableCors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(port, "0.0.0.0");
  logger.log(`Server running on http://0.0.0.0:${port}`);
}

bootstrap();
