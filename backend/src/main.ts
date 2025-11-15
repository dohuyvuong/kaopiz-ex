import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Cấu hình CORS
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    app.enableCors({
      origin: corsOrigin.split(',').map((origin) => origin.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const port = process.env.PORT || 8000;
    await app.listen(port);

    console.log('🚀 KaopizEX đã khởi động thành công!');
    console.log(`📡 API Server đang chạy tại: http://localhost:${port}`);
    console.log(`🌐 CORS enabled cho: ${corsOrigin}`);

    // Xử lý graceful shutdown
    process.on('SIGINT', async () => {
      await app.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('\n' + errorMessage);
    console.error(
      '\n💡 Gợi ý: Gọi GET /auth/authorize để lấy token từ SSO flow\n',
    );
    process.exit(1);
  }
}

bootstrap();
