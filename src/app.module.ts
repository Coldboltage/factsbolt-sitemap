import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SitemapModule } from './sitemap/sitemap.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [SitemapModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
