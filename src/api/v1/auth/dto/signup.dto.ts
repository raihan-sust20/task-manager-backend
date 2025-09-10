import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    description: 'The user\'s first name.',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name cannot be empty.' })
  @MinLength(2, { message: 'First name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'First name cannot be more than 50 characters long.' })
  firstName: string;

  @ApiProperty({
    description: 'The user\'s last name.',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Last name cannot be more than 50 characters long.' })
  lastName: string;

  @ApiProperty({
    description: 'The user\'s email address.',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;

  @ApiProperty({
    description: 'The user\'s password.',
    example: 'password123',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}
