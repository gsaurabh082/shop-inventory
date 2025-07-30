import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
  { path: 'tabs', loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule) },
  { path: 'vendor/:id', loadChildren: () => import('./pages/vendor-detail/vendor-detail.module').then(m => m.VendorDetailPageModule) },
  { path: 'add-transaction/:vendorId', loadChildren: () => import('./pages/add-transaction/add-transaction.module').then(m => m.AddTransactionPageModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}