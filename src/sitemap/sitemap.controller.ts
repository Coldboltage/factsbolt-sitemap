import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SitemapService } from './sitemap.service';
import { CreateSitemapDto } from './dto/create-sitemap.dto';
import { UpdateSitemapDto } from './dto/update-sitemap.dto';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @MessagePattern('createSitemap')
  create(@Payload() createSitemapDto: CreateSitemapDto) {
    return this.sitemapService.create(createSitemapDto);
  }

  @MessagePattern('findAllSitemap')
  findAll() {
    return this.sitemapService.findAll();
  }

  @MessagePattern('findOneSitemap')
  findOne(@Payload() id: number) {
    return this.sitemapService.findOne(id);
  }

  @MessagePattern('updateSitemap')
  update(@Payload() updateSitemapDto: UpdateSitemapDto) {
    return this.sitemapService.update(updateSitemapDto.id, updateSitemapDto);
  }

  @MessagePattern('removeSitemap')
  remove(@Payload() id: number) {
    return this.sitemapService.remove(id);
  }
}
