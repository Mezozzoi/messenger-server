import { NestFactory } from "@nestjs/core";
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AuthorizationIoAdapter } from './adapters/autorization.adapter';
import { AppModule } from './app.module';
import Validation from './pipes/validation.pipe';
import * as process from "process";

async function bootstrap() {
  const PORT = process.env.PORT || 5000;

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env["ORIGIN"],
    credentials: true
  })
  app.use(json({ limit: '250kb' }));
  app.use(urlencoded({ extended: true, limit: '250kb' }));

  app.use(cookieParser())
  app.setGlobalPrefix("/api/v1");
  app.useGlobalPipes(new Validation());
  // app.useGlobalInterceptors(new PostStatusInterceptor())

  app.useWebSocketAdapter(new AuthorizationIoAdapter(app, "/api/v1/ws"));

  await app.listen(PORT);
  console.log(`Server successfully started on port ${ PORT } in ${ process.env.NODE_ENV } mode.`)
}
bootstrap();
