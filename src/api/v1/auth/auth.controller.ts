import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Auth } from './schemas/auth.schema';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: Auth,
  })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  async signup(@Body() signupDto: SignupDto): Promise<any> {
    return this.authService.signup(signupDto);
  }
}