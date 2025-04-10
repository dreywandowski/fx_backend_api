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
  HttpCode,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Onboard a new user to the platform' })
  async create(@Body() createUserDto: CreateUserDto) {
    return {
      status: true,
      message: 'User created successfully',
      statusCode: HttpStatus.CREATED,
      data: await this.authService.create(createUserDto),
    };
  }

  @HttpCode(200)
  @Post('resend-otp')
  @ApiOperation({
    summary: 'resend verification OTP in case they could not get it',
  })
  async resendLink(@Body() resendLink: ResendLinkDto) {
    return {
      status: true,
      message: 'Verification OTP resent successfully',
      statusCode: HttpStatus.OK,
      data: await this.authService.resendOTP(resendLink),
    };
  }

  @HttpCode(200)
  @Post('login')
  @ApiOperation({
    summary:
      'Log the user in the system. If 2FA is completed user will need to use the Bearer obtained from here to verify',
  })
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

  @HttpCode(200)
  @Get('verify')
  @ApiOperation({ summary: 'Verify user email address' })
  async verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto);
    return {
      status: true,
      message: 'Account verified successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @HttpCode(200)
  @Post('refresh-login-token')
  @ApiOperation({ summary: 'Keep user signed in by refresh token' })
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

  @HttpCode(200)
  @UseGuards(VerifyTwoFactorGuard)
  @ApiOperation({ summary: 'Verify user 2fa login' })
  @Post('verify-2fa')
  async verify2fa(@Request() req, @Body() verify2fa: VerifyTwoFactorDto) {
    return {
      status: true,
      message: 'User logged in successfully',
      statusCode: HttpStatus.OK,
      data: await this.authService.verifyTwoFactor(req.user, verify2fa),
    };
  }

  @HttpCode(200)
  @Post('password/request-reset')
  @ApiOperation({ summary: 'Initiate a password reset' })
  async requestReset(@Body() requestResetDto: RequestResetDto) {
    await this.authService.requestPasswordReset(requestResetDto);
    return {
      status: true,
      message: 'Password reset link sent successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @HttpCode(200)
  @Post('password/reset')
  @ApiOperation({ summary: 'Verify and reset user password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return {
      status: true,
      statusCode: HttpStatus.OK,
      data: await this.authService.resetPassword(resetPasswordDto),
    };
  }
}
