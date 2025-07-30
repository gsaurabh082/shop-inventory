import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GMBTransactionService } from '../../services/gmb-transaction.service';
import { Vendor, Transaction } from '../../models/inventory.model';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  vendors: Vendor[] = [];
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedVendorId: string = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private gmbTransactionService: GMBTransactionService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.gmbTransactionService.getVendors().subscribe(vendors => {
      this.vendors = vendors;
    });

    this.gmbTransactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.filterTransactions();
    });
  }

  filterTransactions() {
    if (this.selectedVendorId) {
      this.filteredTransactions = this.transactions.filter(t => t.vendorId === this.selectedVendorId);
    } else {
      this.filteredTransactions = this.transactions;
    }
  }

  getVendorName(vendorId: string): string {
    const vendor = this.vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown';
  }

  addTransaction() {
    this.router.navigate(['/add-transaction']);
  }

  async showTransactionForm(vendorId: string) {
    const vendor = this.vendors.find(v => v.id === vendorId);
    const today = new Date().toISOString().split('T')[0];
    
    const alert = await this.alertController.create({
      header: `Transaction - ${vendor?.name}`,
      message: 'Enter transaction details',
      inputs: [
        {
          name: 'amount',
          type: 'number' as const,
          placeholder: 'Amount (₹)',
          attributes: { min: 0.01, step: 0.01 }
        },
        {
          name: 'description',
          type: 'text' as const,
          placeholder: 'Description (e.g., Payment for goods)'
        },
        {
          name: 'date',
          type: 'date' as const,
          value: today
        },
        {
          name: 'notes',
          type: 'textarea' as const,
          placeholder: 'Additional notes (optional)'
        },
        {
          name: 'type',
          type: 'radio' as const,
          label: '💰 Credit - You received money',
          value: 'credit',
          checked: true
        },
        {
          name: 'type',
          type: 'radio' as const,
          label: '💸 Debit - You gave money',
          value: 'debit'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add Transaction',
          handler: async (data) => {
            if (data.amount && data.description && data.type) {
              const transactionDate = data.date ? new Date(data.date) : new Date();
              const transaction = new Transaction(
                this.gmbTransactionService.generateId(),
                vendorId,
                data.type,
                parseFloat(data.amount),
                data.description,
                data.notes || '',
                transactionDate
              );
              await this.gmbTransactionService.addTransaction(transaction);
              
              const successAlert = await this.alertController.create({
                header: 'Success',
                message: `Transaction added successfully for ${vendor?.name}`,
                buttons: ['OK']
              });
              await successAlert.present();
              return true;
            } else {
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Please fill in all required fields',
                buttons: ['OK']
              });
              await errorAlert.present();
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}