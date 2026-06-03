import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BasicInfoDto {
  @ApiProperty({ description: 'Full name of the athlete' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Date of birth (ISO format)',
    example: '1998-05-15',
  })
  @IsDateString()
  @IsNotEmpty()
  dob: string;

  @ApiProperty({ description: 'Gender of the athlete', example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ description: 'State of residence' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'City of residence' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'Profile avatar URL' })
  @IsString()
  @IsOptional()
  profilePhoto?: string;
}
