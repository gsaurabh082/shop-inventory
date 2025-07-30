import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  { path: 'vendors', loadChildren: () => import('./pages/vendors/vendors.module').then(m => m.VendorsPageModule) },
  { path: 'transactions', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsPageModule) },
  { path: 'add-transaction', loadChildren: () => import('./pages/add-transaction/add-transaction.module').then(m => m.AddTransactionPageModule) },
  { path: 'vendor/:id', loadChildren: () => import('./pages/vendor-detail/vendor-detail.module').then(m => m.VendorDetailPageModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}