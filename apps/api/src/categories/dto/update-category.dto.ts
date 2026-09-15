import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './category.dto.js';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
