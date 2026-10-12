import { Body, Controller, Delete, Get, HttpCode, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { Auth, Permission } from '../auth/auth.guard.js';
import { AdminProductQuery, CreateProductDto, PublicProductQuery, UpdateProductDto } from './products.dto.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class PublicProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  list(@Query() query: PublicProductQuery) {
    return this.service.listPublic(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findPublicBySlug(slug);
  }
}

@Controller('admin/products')
@Auth()
@Permission('products')
export class AdminProductsController {
  constructor(private readonly service: ProductsService) {}

  // Người soạn bài viết / trang / chính sách / khối trang chủ cần danh sách sản phẩm để chèn "ô sản phẩm".
  @Get()
  @Permission('products', 'posts', 'pages', 'policies', 'homeBlocks')
  list(@Query() query: AdminProductQuery) {
    return this.service.listAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}

@Module({
  controllers: [PublicProductsController, AdminProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
