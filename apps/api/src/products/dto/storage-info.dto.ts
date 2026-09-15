import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

export class StorageInfoDto {
  @IsString()
  @MinLength(1)
  temperature!: string;

  @IsInt()
  @IsPositive()
  shelfLifeDays!: number;

  @IsString()
  @MinLength(1)
  thawInstructions!: string;
}
