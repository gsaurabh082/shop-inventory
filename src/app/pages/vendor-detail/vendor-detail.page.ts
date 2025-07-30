import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GMBTransactionService } from '../../services/gmb-transaction.service';
import { Vendor, Transaction, VendorReport } from '../../models/inventory.model';

@Component({
  selector: 'app-vendor-detail',
  templateUrl: './vendor-detail.page.html',
  styleUrls: ['./vendor-detail.page.scss'],
})
export class VendorDetailPage implements OnInit {
  vendor: Vendor | null = null;
  transactions: Transaction[] = [];
  vendorReport: VendorReport | null = null;
  vendorId: string = '';
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private gmbTransactionService: GMBTransactionService
  ) {}

  ngOnInit() {
    this.vendorId = this.route.snapshot.paramMap.get('id') || '';
    this.loadVendorData();
  }

  loadVendorData() {
    this.gmbTransactionService.getVendors().subscribe(vendors => {
      this.vendor = vendors.find(v => v.id === this.vendorId) || null;
      if (this.vendor) {
        this.vendorReport = this.gmbTransactionService.getVendorReport(this.vendorId);
      }
    });

    this.gmbTransactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions
        .filter(t => t.vendorId === this.vendorId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  async addTransaction() {
    const alert = await this.alertController.create({
      header: `Add Transaction - ${this.vendor?.name}`,
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount',
          attributes: { required: true }
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description',
          attributes: { required: true }
        },
        {
          name: 'notes',
          type: 'text',
          placeholder: 'Notes (optional)'
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Debit (You gave)',
          value: 'debit',
          checked: true
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Credit (You received)',
          value: 'credit',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: async (data) => {
            if (data.amount && data.description && data.type) {
              const transaction = new Transaction(
                this.gmbTransactionService.generateId(),
                this.vendorId,
                data.type,
                parseFloat(data.amount),
                data.description,
                data.notes
              );
              await this.gmbTransactionService.addTransaction(transaction);
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  getTransactionColor(type: string): string {
    return type === 'debit' ? 'danger' : 'success';
  }

  getBalanceClass(): string {
    if (!this.vendor) return '';
    if (this.vendor.balance > 0) return 'text-danger';
    if (this.vendor.balance < 0) return 'text-success';
    return 'text-medium';
  }

  getBalanceText(): string {
    if (!this.vendor) return 'Settled';
    if (this.vendor.balance > 0) return 'You owe';
    if (this.vendor.balance < 0) return 'Owes you';
    return 'Settled';
  }

  async generateReport() {
    if (!this.vendorReport) return;

    const reportHtml = `
    <div style="font-family: 'Roboto', sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="background: #ffffff; margin: 20px auto; padding: 24px; max-width: 800px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        <h2 style="color: #6200ea; text-align: center; font-weight: 500; margin-top: 0;">Vendor Credit/Debit Summary</h2>
        <div style="font-size: 1.1em; color: #03dac6; margin-bottom: 8px;">Vendor: ${this.vendor?.name}</div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr>
              <th style="background-color: #e0e0e0; color: #616161; padding: 12px; text-align: left; font-weight: 500;">Date</th>
              <th style="background-color: #e0e0e0; color: #616161; padding: 12px; text-align: left; font-weight: 500;">Type</th>
              <th style="background-color: #e0e0e0; color: #616161; padding: 12px; text-align: left; font-weight: 500;">Amount (₹)</th>
              <th style="background-color: #e0e0e0; color: #616161; padding: 12px; text-align: left; font-weight: 500;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${this.transactions.map(t => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">${new Date(t.date).toLocaleDateString()}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">₹${t.amount}</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">${t.notes || t.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 8px; text-align: right; font-weight: bold; color: #424242;">Balance: ₹${Math.abs(this.vendor?.balance || 0)}</div>
        <div style="margin-top: 10px; font-size: 0.9em; color: #757575;">Contact: ${this.vendor?.contact} | Address: ${this.vendor?.address}</div>
      </div>
    </div>
    `;

    const alert = await this.alertController.create({
      header: '',
      message: reportHtml,
      buttons: ['Close'],
      cssClass: 'report-alert'
    });
    await alert.present();
  }
}