import { Module } from '@nestjs/common';
import { AdminBannersController, BannersService, PublicBannersController } from './banners.js';
import { AdminPoliciesController, PoliciesService, PublicPoliciesController } from './policies.js';
import { AdminPostsController, PostsService, PublicPostsController } from './posts.js';
import { AdminSettingsController, PublicSettingsController, SettingsService } from './settings.js';

/** Nội dung hiển thị trên web khách hàng ngoài sản phẩm: bài viết, banner, chính sách, thông tin cửa hàng. */
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
  ],
  providers: [PostsService, BannersService, PoliciesService, SettingsService],
})
export class ContentModule {}
