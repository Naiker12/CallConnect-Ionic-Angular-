import { NgModule } from '@angular/core';
import { RecoverPageRoutingModule } from './recover-routing.module';
import { RecoverPage } from './recover.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    RecoverPageRoutingModule
  ],
  declarations: [RecoverPage]
})
export class RecoverPageModule {}
