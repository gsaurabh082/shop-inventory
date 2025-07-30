import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-transactions',
  templateUrl: 'transactions.page.html'
})
export class TransactionsPage {
  transactions = [];
  filteredTransactions = [];
  inventory = [];
  vendors = [];
  selectedType = 'all';

  constructor(inventoryService, alertController) {
    this.inventoryService = inventoryService;
    this.alertController = alertController;
    this.loadData();
  }

  loadData() {
    this.inventoryService.getTransactions().subscribe(t => {
      this.transactions = t;
      this.filterTransactions();
    });
    this.inventoryService.getInventory().subscribe(items => this.inventory = items);
    this.inventoryService.getVendors().subscribe(vendors => this.vendors = vendors);
  }

  filterTransactions() {
    this.filteredTransactions = this.selectedType === 'all' 
      ? this.transactions 
      : this.transactions.filter(t => t.type === this.selectedType);
  }

  async addTransaction() {
    const alert = await this.alertController.create({
      header: 'Add Transaction',
      inputs: [
        {
          name: 'type',
          type: 'radio',
          label: 'Sale',
          value: 'sale',
          checked: true
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Purchase',
          value: 'purchase'
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Credit Taken',
          value: 'credit'
        },
        {
          name: 'type',
          type: 'radio',
          label: 'Payment Made',
          value: 'payment'
        }
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Next',
          handler: (type) => {
            this.showTransactionDetails(type);
          }
        }
      ]
    });
    await alert.present();
  }

  async showTransactionDetails(type) {
    const inputs = [
      { name: 'date', type: 'date', value: new Date().toISOString().split('T')[0] },
      { name: 'amount', type: 'number', placeholder: 'Amount (₹)' },
      { name: 'description', placeholder: 'Description' }
    ];

    if (type === 'sale' || type === 'purchase') {
      inputs.splice(1, 0, { name: 'quantity', type: 'number', placeholder: 'Quantity' });
    }

    const alert = await this.alertController.create({
      header: `Add ${type}`,
      inputs,
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (data.amount && data.description) {
              this.inventoryService.addTransaction(
                type,
                parseFloat(data.amount),
                data.description,
                this.inventory[0]?.id,
                this.vendors[0]?.id,
                parseFloat(data.quantity) || null,
                data.date ? new Date(data.date) : new Date()
              );
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getTypeColor(type) {
    const colors = {
      sale: 'success',
      purchase: 'primary',
      credit: 'warning',
      payment: 'secondary'
    };
    return colors[type] || 'medium';
  }
}