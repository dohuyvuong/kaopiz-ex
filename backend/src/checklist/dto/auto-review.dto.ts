import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AutoReviewQueryDto {
  @IsNotEmpty({ message: 'maxReviews là tham số bắt buộc' })
  @Type(() => Number)
  @IsInt({ message: 'maxReviews phải là số nguyên' })
  @Min(1, { message: 'maxReviews phải là số nguyên dương' })
  maxReviews: number;

  @IsNotEmpty({ message: 'projectName là tham số bắt buộc' })
  @IsString({ message: 'projectName phải là chuỗi' })
  projectName: string;
}
