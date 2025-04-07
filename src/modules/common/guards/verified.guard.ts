import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    if (!user.is_email_verified) {
      throw new UnauthorizedException(
        'Email not verified. Please check your inbox (and maybe your spam folder, too).',
      );
    }

    return true;
  }
}
