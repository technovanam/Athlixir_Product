import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BodyMetricsDto {
  @ApiProperty({ description: 'Height in centimeters', example: 178 })
  @IsNumber()
  @IsNotEmpty()
  @Min(50)
  @Max(300)
  heightCm: number;

  @ApiProperty({ description: 'Weight in kilograms', example: 70 })
  @IsNumber()
  @IsNotEmpty()
  @Min(10)
  @Max(500)
  weightKg: number;
}
