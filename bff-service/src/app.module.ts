import {CacheModule, HttpModule, Module} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';


@Module({
  imports: [ConfigModule.forRoot(), HttpModule, CacheModule.register()],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
