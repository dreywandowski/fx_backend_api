import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Res,
  HttpStatus,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './service/auth.service';
import {
  CreateUserDto,
  LoginUserDto,
  RefreshTokenDto,
  RequestResetDto,
  ResendLinkDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/user.dto';
import { VerifyTwoFactorDto } from './dto/2fa.dto';
import { VerifyTwoFactorGuard } from '../common/guards/verify2fa.guard';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      status: true,
      message: 'User created successfully',
      statusCode: HttpStatus.CREATED,
      data: await this.authService.create(createUserDto),
    };
  }

  @Post('resend-link')
  async resendLink(@Body() resendLink: ResendLinkDto) {
    return {
      status: true,
      message: 'Verification link resent successfully',
      statusCode: HttpStatus.OK,
      data: await this.authService.resendLink(resendLink),
    };
  }

  @Get('verify')
  async verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto);
    return {
      status: true,
      message: 'Account verified successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const loginResponse = await this.authService.login(loginUserDto);

    if (loginResponse?.twoFactorRequired) {
      return {
        status: true,
        message: 'Enter the OTP sent to your registered device',
        statusCode: HttpStatus.OK,
        data: {
          twoFactorRequired: true,
          tempToken: loginResponse.tempToken,
        },
      };
    } else {
      const { twoFactorRequired, tempToken, ...rest } = loginResponse;
      return {
        status: true,
        message: 'User logged in successfully',
        statusCode: HttpStatus.OK,
        data: rest,
      };
    }
  }

  @Post('refresh-login-token')
  async refreshToken(
    @Body() refresh: RefreshTokenDto,
    @Res() response: Response,
    @Request() request,
  ) {
    const refreshToken = await this.authService.refreshToken({
      data: refresh,
    });
    return response.status(HttpStatus.OK).json({
      status: true,
      message: 'Refresh Token generated successfully',
      statusCode: HttpStatus.OK,
      data: refreshToken,
    });
  }

  @UseGuards(VerifyTwoFactorGuard)
  @Post('verify-2fa')
  async verify2fa(@Request() req, @Body() verify2fa: VerifyTwoFactorDto) {
    return {
      status: true,
      message: 'User logged in successfully',
      statusCode: HttpStatus.OK,
      data: await this.authService.verifyTwoFactor(req.user, verify2fa),
    };
  }

  @Post('password/request-reset')
  async requestReset(@Body() requestResetDto: RequestResetDto) {
    await this.authService.requestPasswordReset(requestResetDto);
    return {
      status: true,
      message: 'Password reset link sent successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('password/reset')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return {
      status: true,
      statusCode: HttpStatus.OK,
      data: await this.authService.resetPassword(resetPasswordDto),
    };
  }
}
