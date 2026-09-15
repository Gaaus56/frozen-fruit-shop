import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogPostDto } from './blog-post.dto.js';

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
