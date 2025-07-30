import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { GMBTransactionService } from '../../services/gmb-transaction.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  selectedMonth: string = '';
  selectedPeriod: string = 'month';
  monthlyReport: any = null;
  totalSales = 15000;
  totalExpenses = 8500;
  netProfit = 6500;
  totalTransactions = 45;
  Math = Math;

  constructor(
    private gmbTransactionService: GMBTransactionService
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.selectedMonth = new Date().toISOString().substring(0, 7);
    this.loadReport();
  }

  refreshData() {
    console.log('Refreshing reports data...');
    this.loadReport();
  }

  loadReport() {
    if (this.selectedMonth) {
      this.monthlyReport = this.gmbTransactionService.getMonthlyReport(this.selectedMonth);
    }
  }

  async viewDailySummary() {
    const alert = await this.alertController.create({
      header: 'Daily Summary',
      message: 'View detailed daily business summary with sales, expenses, and profit analysis.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async viewMonthlySummary() {
    const alert = await this.alertController.create({
      header: 'Monthly Report',
      message: 'Comprehensive monthly report with vendor analysis, transaction summaries, and profit/loss statements.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async viewLowStockAlert() {
    const alert = await this.alertController.create({
      header: 'Stock Alerts',
      message: 'Items running low on stock: Sugar (5kg), Khowa (2kg), Gas Cylinder (1 unit)',
      buttons: ['OK']
    });
    await alert.present();
  }

  async exportReports() {
    const alert = await this.alertController.create({
      header: 'Export Reports',
      message: 'Export your business data in PDF or Excel format for accounting and analysis.',
      buttons: ['OK']
    });
    await alert.present();
  }
}