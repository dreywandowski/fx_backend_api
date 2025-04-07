import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { FxService } from '../service/fx.service';
import { GetFxRatesDto } from '../dto/fx.dto';
import { AuthGuard } from 'src/modules/common/guards/auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('fx')
@UseGuards(AuthGuard)
export class FxController {
  constructor(private readonly fxService: FxService) {}

  @Get('rates')
  @ApiOperation({
    summary: 'Get real-time fx rates of naira against selected currencies',
  })
  async getFxRates(@Req() req, @Query() getFxRatesDto: GetFxRatesDto) {
    return this.fxService.getRates(req, getFxRatesDto);
  }
}
