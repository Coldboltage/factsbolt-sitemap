import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateSitemapDto } from './dto/create-sitemap.dto';
import { UpdateSitemapDto } from './dto/update-sitemap.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import Sitemapper, { SitemapperOptions } from 'sitemapper';
import { Site } from './entities/site-definitions';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SitemapService implements OnModuleInit {
  constructor(@Inject('SITEMAP_EXTRACTOR') private client: ClientProxy) {}
  private readonly logger = new Logger(SitemapService.name);

  async onModuleInit() {
    console.log(`${SitemapService.name} has been initialized.`);
    await this.sitemapChecker(
      'https://www.reuters.com/arc/outboundfeeds/news-sitemap-index/?outputType=xml',
      Site.REUTERS,
    );
    if (process.env.FULL_SITE_CHECK === 'true')
      // await this.fullsiteOneTimeChecker(
      //   'https://www.bbc.com/sitemaps/https-index-com-news.xml',
      //   Site.BBC,
      // );
      await this.fullsiteOneTimeChecker(
        'https://www.reuters.com/arc/outboundfeeds/news-sitemap-index/?outputType=xml',
        Site.REUTERS,
      );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    console.log('Hello');
    this.logger.debug(`Called at ${Date.now()}`);
    await this.sitemapChecker(
      'https://www.reuters.com/arc/outboundfeeds/news-sitemap-index/?outputType=xml',
      Site.REUTERS,
    );
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
  async sitemapParse(
    sitemap: string,
    site: Site,
    lastmodTime?: number,
  ): Promise<string[]> {
    const sitemapOptions: SitemapperOptions = {
      url: sitemap,
      timeout: 15000, // 15 seconds
      requestHeaders: {},
      debug: true,
    };

    if (lastmodTime) sitemapOptions.lastmod = lastmodTime;

    const siteMapLinks = new Sitemapper(sitemapOptions);

    const xmlLinks: string[] = [];
    const siteSpecLinks: string[] = [];

    try {
      const result = await siteMapLinks.fetch();
      switch (site) {
        case Site.BBC:
          const filteredSites = result.sites.filter((url) => {
            return url.includes('https://www.bbc.com/news/') &&
              !url.includes('/live/')
              ? true
              : false;
          });
          siteSpecLinks.push(...filteredSites);
          break;
        case Site.REUTERS:
          const filteredSitesReuters = result.sites.filter((url) => {
            return !url.includes('/sports/') && !url.includes('/live/')
              ? true
              : false;
          });
          siteSpecLinks.push(...filteredSitesReuters);
      }
      console.log(siteSpecLinks);
      // xmlLinks.push(...result.sites)
    } catch (error) {
      console.log(error);
    }
    return siteSpecLinks;
  }

  async sendSitemapLinks(urls: string[]) {
    this.client.emit<string[]>('add_sites', urls);
  }

  async sitemapChecker(sitemap: string, site: Site) {
    const sitemapLinks = await this.sitemapParse(
      sitemap,
      site,
      Date.now() - 600000, // 5 minutes
    );
    if (sitemapLinks.length > 0) {
      this.logger.debug('Sitemap Links Populated');
      await this.siteLinksBundler(sitemapLinks);
    }
  }

  async fullsiteOneTimeChecker(sitemap: string, site: Site) {
    const sitemapLinks = await this.sitemapParse(sitemap, site);
    if (sitemapLinks.length > 0) {
      this.logger.debug('Sitemap Links Populated');
      console.log(sitemapLinks);
      await this.siteLinksBundler(sitemapLinks);
      // await this.sendSitemapLinks(sitemapLinks);
    }
  }

  async siteLinksBundler(sitemap: string[]) {
    let bundledArray = [];
    for (const link of sitemap) {
      if (bundledArray.length < 1) {
        bundledArray.push(link);
      } else {
        await this.sendSitemapLinks(bundledArray);
        bundledArray = [];
        bundledArray.push(link);
      }
    }
  }
}
