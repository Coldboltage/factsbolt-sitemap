import { Module } from '@nestjs/common';
import { SitemapService } from './sitemap.service';
import { SitemapController } from './sitemap.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SITEMAP_EXTRACTOR',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'video_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [SitemapController],
  providers: [SitemapService],
})
export class SitemapModule {}
