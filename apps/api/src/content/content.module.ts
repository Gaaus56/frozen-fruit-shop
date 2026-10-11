import { Module } from '@nestjs/common';
import { AdminBannersController, BannersService, PublicBannersController } from './banners.js';
import { AdminHomeBlocksController, HomeBlocksService, PublicHomeBlocksController } from './home-blocks.js';
import { AdminPagesController, PagesService, PublicPagesController } from './pages.js';
import { AdminPoliciesController, PoliciesService, PublicPoliciesController } from './policies.js';
import { AdminPostsController, PostsService, PublicPostsController } from './posts.js';
import { AdminSettingsController, PublicSettingsController, SettingsService } from './settings.js';

/** Nội dung hiển thị trên web khách hàng ngoài sản phẩm: bài viết, banner, chính sách, trang Giới thiệu, khối trang chủ, thông tin cửa hàng. */
@Module({
  controllers: [
    PublicPostsController,
    AdminPostsController,
    PublicBannersController,
    AdminBannersController,
    PublicPoliciesController,
    AdminPoliciesController,
    PublicSettingsController,
    AdminSettingsController,
    PublicPagesController,
    AdminPagesController,
    PublicHomeBlocksController,
    AdminHomeBlocksController,
  ],
  providers: [PostsService, BannersService, PoliciesService, SettingsService, PagesService, HomeBlocksService],
})
export class ContentModule {}
