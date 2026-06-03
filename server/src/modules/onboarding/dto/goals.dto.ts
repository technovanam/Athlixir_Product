import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoalsDto {
  @ApiProperty({
    description: 'List of target dynamic goals selected by the athlete',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  goals: string[];
}
