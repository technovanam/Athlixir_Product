import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrainingProfileDto {
  @ApiProperty({ description: 'Weekly active training days', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(7)
  trainingDays: number;

  @ApiProperty({
    description: 'Average active session duration in minutes',
    example: 90,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(10)
  @Max(600)
  trainingDuration: number;

  @ApiProperty({
    description: 'Total years of competitive/running experience',
    example: 3,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(80)
  experienceYears: number;

  @ApiPropertyOptional({
    description: 'Personal best records',
    example: '100m -> 12.4s',
  })
  @IsString()
  @IsOptional()
  personalBest?: string;

  @ApiPropertyOptional({
    description: 'Custom athlete achievements JSON string',
    example: '[{"title":"State Champ","desc":"2023"}]',
  })
  @IsString()
  @IsOptional()
  achievements?: string;
}
