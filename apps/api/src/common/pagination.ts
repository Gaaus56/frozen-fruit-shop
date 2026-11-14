import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  // Trang quá lớn làm OFFSET vượt giới hạn số nguyên → lỗi 500.
  @Max(10_000)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}

export function paginate(query: PaginationQueryDto) {
  return { skip: (query.page - 1) * query.pageSize, take: query.pageSize };
}
