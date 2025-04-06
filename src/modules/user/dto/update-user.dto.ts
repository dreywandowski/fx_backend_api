import { PartialType } from '@nestjs/mapped-types';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstname?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastname?: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1990-05-21',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : null))
  date_of_birth?: Date;

  @ApiProperty({
    description: 'Nationality of the user',
    example: 'American',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  nationality?: string;

  @ApiProperty({
    description: 'Gender of the user',
    example: 'male',
    required: false,
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsString()
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'User postcode',
    example: '12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 10)
  postcode?: string;

  @ApiProperty({
    description: 'State of residence',
    example: 'California',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  state?: string;

  @ApiProperty({
    description: 'Job of user',
    example: 'Software Engineer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  occupation?: string;

  @ApiProperty({
    description: 'customizable user link',
    example: 'henry',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(6, 50)
  aishtar_link?: string;

  @ApiProperty({
    description: 'Country (not editable)',
    example: 'USA',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  country?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? JSON.stringify(value) : value))
  two_factor_backup_codes?: string;
}
