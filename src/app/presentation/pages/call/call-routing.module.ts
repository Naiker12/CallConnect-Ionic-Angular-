import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CallPage } from './call.page';

const routes: Routes = [
  {
    path: '',
    component: CallPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CallPageRoutingModule {}
