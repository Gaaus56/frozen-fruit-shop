import { IsDateString, IsString, MinLength } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  coverImage!: string;

  @IsString()
  @MinLength(1)
  excerpt!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsString()
  @MinLength(1)
  category!: string;

  @IsDateString()
  publishedAt!: string;
}
