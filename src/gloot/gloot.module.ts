import { Module, HttpModule } from '@nestjs/common';
import { GlootService } from './gloot.service';

@Module({
  imports: [HttpModule],
  providers: [GlootService],
  exports: [GlootService],
})
export class GlootModule {}
