import { type DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigInitService } from './config-init.service';

@Global()
@Module({
    providers: [ConfigInitService],
    exports: [ConfigInitService],
})
export class ConfigInitModule {
    static forRoot(): DynamicModule {
        return {
            module: ConfigInitModule
        };
    }
}
