import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  ConfirmTwoFactorDto,
  EnableTwoFactorDto,
  UpdateTwoFactorMethodDto,
} from '../dto/2fa.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { OtpService } from '../../auth/service/otp.service';

@ApiTags('Users')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('2fa/enable')
  async enableTwoFactor(
    @Request() req,
    @Body() enableTwoFactor: EnableTwoFactorDto,
  ) {
    return {
      status: true,
      message: '2FA enabled successfully',
      statusCode: HttpStatus.OK,
      data: await this.userService.enableTwoFactor(req.user, enableTwoFactor),
    };
  }

  @Post('2fa/confirm')
  async confirmTwoFactor(
    @Request() req,
    @Body() confirmTwoFactor: ConfirmTwoFactorDto,
  ) {
    return {
      status: true,
      message: '2FA secret confirmed successfully',
      statusCode: HttpStatus.OK,
      data: await this.userService.confirmTwoFactor(req.user, confirmTwoFactor),
    };
  }

  @Patch('2fa/method')
  async updateTwoFactorMethod(
    @Request() req,
    @Body() updateTwoFactorMethod: UpdateTwoFactorMethodDto,
  ) {
    return {
      status: true,
      message: '2FA secret updated successfully',
      statusCode: HttpStatus.OK,
      data: await this.userService.updateTwoFactorMethod(
        req.user,
        updateTwoFactorMethod,
      ),
    };
  }

  @Post('2fa/disable')
  async disableTwoFactor(@Request() req, user) {
    return {
      status: true,
      message: '2FA disabled successfully',
      statusCode: HttpStatus.OK,
      data: await this.userService.disableTwoFactor(req.user),
    };
  }

  @Post('2fa/backup-codes/regenerate')
  async regenerateBackupCodes(@Req() req) {
    return {
      status: true,
      message: 'Backup codes generated succesfully',
      statusCode: HttpStatus.OK,
      data: await this.otpService.generateBackupCodes(req.user),
    };
  }
}
