import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VendorDetailPageRoutingModule } from './vendor-detail-routing.module';
import { VendorDetailPage } from './vendor-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VendorDetailPageRoutingModule
  ],
  declarations: [VendorDetailPage]
})
export class VendorDetailPageModule {}