import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateJWT(payload: any, options?: JwtSignOptions): Promise<string> {
    return this.jwtService.signAsync(payload, {
      issuer: this.configService.get('jwt.issuer'),
      secret: this.configService.get('jwt.secret'),
      ...options,
    });
  }

  async verifyJWT(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get('jwt.secret'),
      issuer: this.configService.get('jwt.issuer'),
    });
  }
}
