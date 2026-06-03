import {
  IsArray,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InjuryHistoryDto {
  @ApiProperty({
    description: 'List of past active injury sites',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  injuries: string[];

  @ApiProperty({
    description: 'Indicates if current pain exists',
    example: false,
  })
  @IsBoolean()
  currentPain: boolean;

  @ApiProperty({ description: 'Subjective severity rating (0-10)', example: 3 })
  @IsNumber()
  @Min(0)
  @Max(10)
  severity: number;
}
