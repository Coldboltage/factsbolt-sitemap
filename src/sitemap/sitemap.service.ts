import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateSitemapDto } from './dto/create-sitemap.dto';
import { UpdateSitemapDto } from './dto/update-sitemap.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import Sitemapper from 'sitemapper';
import { Site } from './entities/site-definitions';

@Injectable()
export class SitemapService implements OnModuleInit {
  private readonly logger = new Logger(SitemapService.name);

  onModuleInit() {
    console.log(`${SitemapService.name} has been initialized.`);
    this.sitemapParse(
      'https://www.bbc.com/sitemaps/https-index-com-news.xml',
      Site.BBC,
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    console.log('Hello');
    this.logger.debug(`Called at ${Date.now()}`);
  }

  create(createSitemapDto: CreateSitemapDto) {
    return 'This action adds a new sitemap';
  }

  findAll() {
    return `This action returns all sitemap`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sitemap`;
  }

  update(id: number, updateSitemapDto: UpdateSitemapDto) {
    return `This action updates a #${id} sitemap`;
  }

  remove(id: number) {
    return `This action removes a #${id} sitemap`;
  }

  // Utilities

  async sitemapParse(sitemap: string, site: Site): Promise<string[]> {
    const siteMapLinks = new Sitemapper({
      url: sitemap,
      timeout: 15000, // 15 seconds
      requestHeaders: {},
      lastmod: Date.now() - 300000,
      debug: true,
    });

    const xmlLinks: string[] = [];
    const siteSpecLinks: string[] = [];

    try {
      const result = await siteMapLinks.fetch();
      switch (site) {
        case Site.BBC:
          const filteredSites = result.sites.filter((url) => {
            return url.includes('https://www.bbc.com/news/') ? true : false;
          });
          siteSpecLinks.push(...filteredSites);
      }
      console.log(siteSpecLinks);
      // xmlLinks.push(...result.sites)
    } catch (error) {
      console.log(error);
    }
    return siteSpecLinks;
  }
}
