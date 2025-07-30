import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorDetailPage } from './vendor-detail.page';

const routes: Routes = [
  { path: '', component: VendorDetailPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorDetailPageRoutingModule {}