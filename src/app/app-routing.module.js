import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule } from '@angular/router';

const routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  { path: 'inventory', loadChildren: () => import('./pages/inventory/inventory.module').then(m => m.InventoryPageModule) },
  { path: 'vendors', loadChildren: () => import('./pages/vendors/vendors.module').then(m => m.VendorsPageModule) },
  { path: 'transactions', loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsPageModule) },
  { path: 'reports', loadChildren: () => import('./pages/reports/reports.module').then(m => m.ReportsPageModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}