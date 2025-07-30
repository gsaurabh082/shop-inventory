import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { GMBTransactionService } from '../../services/gmb-transaction.service';
import { Vendor, Transaction } from '../../models/inventory.model';

@Component({
  selector: 'app-vendor-detail',
  templateUrl: './vendor-detail.page.html',
  styleUrls: ['./vendor-detail.page.scss'],
})
export class VendorDetailPage implements OnInit {
  vendor: Vendor | null = null;
  transactions: Transaction[] = [];
  vendorId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private gmbTransactionService: GMBTransactionService
  ) {}

  ngOnInit() {
    this.vendorId = this.route.snapshot.paramMap.get('id') || '';
    this.loadData();
  }

  loadData() {
    this.gmbTransactionService.getVendors().subscribe(vendors => {
      this.vendor = vendors.find(v => v.id === this.vendorId) || null;
    });

    this.gmbTransactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions
        .filter(t => t.vendorId === this.vendorId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  addTransaction() {
    this.router.navigate(['/add-transaction'], {
      queryParams: { vendorId: this.vendorId }
    });
  }

  async addTransactionOld() {
    const today = new Date().toISOString().split('T')[0];
    
    const alert = await this.alertController.create({
      header: `Add Transaction - ${this.vendor?.name}`,
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
                this.vendorId,
                data.type,
                parseFloat(data.amount),
                data.description,
                data.notes || '',
                transactionDate
              );
              await this.gmbTransactionService.addTransaction(transaction);
              
              const successAlert = await this.alertController.create({
                header: 'Success',
                message: 'Transaction added successfully!',
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

  async editTransaction(transaction: Transaction) {
    const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
    
    const alert = await this.alertController.create({
      header: 'Edit Transaction',
      message: 'Update transaction details',
      inputs: [
        {
          name: 'amount',
          type: 'number' as const,
          placeholder: 'Amount',
          value: transaction.amount.toString(),
          attributes: { min: 0.01, step: 0.01 }
        },
        {
          name: 'description',
          type: 'text' as const,
          placeholder: 'Description',
          value: transaction.description
        },
        {
          name: 'date',
          type: 'date' as const,
          value: transactionDate
        },
        {
          name: 'notes',
          type: 'textarea' as const,
          placeholder: 'Notes',
          value: transaction.notes || ''
        },
        {
          name: 'type',
          type: 'radio' as const,
          label: '💰 Credit - You received money',
          value: 'credit',
          checked: transaction.type === 'credit'
        },
        {
          name: 'type',
          type: 'radio' as const,
          label: '💸 Debit - You gave money',
          value: 'debit',
          checked: transaction.type === 'debit'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update Transaction',
          handler: async (data) => {
            if (data.amount && data.description && data.type) {
              const updatedDate = data.date ? new Date(data.date) : transaction.date;
              await this.gmbTransactionService.updateTransaction(transaction.id, {
                amount: parseFloat(data.amount),
                description: data.description,
                notes: data.notes || '',
                type: data.type,
                date: updatedDate
              });
              
              const successAlert = await this.alertController.create({
                header: 'Success',
                message: 'Transaction updated successfully!',
                buttons: ['OK']
              });
              await successAlert.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteTransaction(transaction: Transaction) {
    const alert = await this.alertController.create({
      header: 'Delete Transaction',
      message: 'Delete this transaction?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            await this.gmbTransactionService.deleteTransaction(transaction.id);
          }
        }
      ]
    });
    await alert.present();
  }

  addCreditTransaction() {
    this.router.navigate(['/add-transaction'], {
      queryParams: { vendorId: this.vendorId, type: 'credit' }
    });
  }

  addDebitTransaction() {
    this.router.navigate(['/add-transaction'], {
      queryParams: { vendorId: this.vendorId, type: 'debit' }
    });
  }

  async showQuickTransactionForm(type: 'credit' | 'debit') {
    const today = new Date().toISOString().split('T')[0];
    const typeLabel = type === 'credit' ? 'Credit (You received)' : 'Debit (You gave)';
    
    const alert = await this.alertController.create({
      header: `${typeLabel} - ${this.vendor?.name}`,
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
          placeholder: 'Description'
        },
        {
          name: 'date',
          type: 'date' as const,
          value: today
        },
        {
          name: 'notes',
          type: 'textarea' as const,
          placeholder: 'Notes (optional)'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (data) => {
            if (data.amount && data.description) {
              const transactionDate = data.date ? new Date(data.date) : new Date();
              const transaction = new Transaction(
                this.gmbTransactionService.generateId(),
                this.vendorId,
                type,
                parseFloat(data.amount),
                data.description,
                data.notes || '',
                transactionDate
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

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'zero';
  }

  getBalanceStatus(balance: number): string {
    if (balance > 0) return 'You owe';
    if (balance < 0) return 'They owe';
    return 'Settled';
  }
}