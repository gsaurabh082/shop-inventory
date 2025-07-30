import { Component } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-reports',
  templateUrl: 'reports.page.html'
})
export class ReportsPage {
  todayReport = { totalSales: 0, totalPurchases: 0, totalCredit: 0, totalPayments: 0 };
  lowStockItems = [];

  constructor(inventoryService) {
    this.inventoryService = inventoryService;
    this.loadReports();
  }

  loadReports() {
    this.todayReport = this.inventoryService.getDailyReport(new Date());
    
    this.inventoryService.getInventory().subscribe(items => {
      this.lowStockItems = items.filter(item => item.quantity < 10);
    });
  }
}