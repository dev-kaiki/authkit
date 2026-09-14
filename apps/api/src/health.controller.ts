import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/public.decorator';

@ApiTags('health')
@Controller()
export class HealthController {
  // Public on purpose: Render polls this to decide whether the deploy is live
  // (healthCheckPath in render.yaml), and it has no token to present.
  @Public()
  @Get('/health')
  @ApiOperation({ summary: 'Liveness probe' })
  health() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
