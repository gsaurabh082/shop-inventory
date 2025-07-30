import { Component, OnInit } from '@angular/core';
import { AlertController, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss']
})
export class TransactionsPage implements OnInit {
  todaySales = 2500;
  todayPurchases = 1800;
  totalTransactions = 12;
  netAmount = 700;
  creditGiven = 500;
  paymentsReceived = 2000;

  constructor(
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
  }

  refreshData() {
    console.log('Refreshing transaction data...');
  }

  async showTransactionOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Record Transaction',
      buttons: [
        {
          text: 'Sale',
          icon: 'trending-up-outline',
          handler: () => this.recordSale()
        },
        {
          text: 'Purchase',
          icon: 'trending-down-outline',
          handler: () => this.recordPurchase()
        },
        {
          text: 'Credit',
          icon: 'card-outline',
          handler: () => this.recordCredit()
        },
        {
          text: 'Payment',
          icon: 'cash-outline',
          handler: () => this.recordPayment()
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async recordSale() {
    const alert = await this.alertController.create({
      header: 'Record Sale',
      inputs: [
        { name: 'amount', type: 'number', placeholder: 'Sale Amount' },
        { name: 'customer', type: 'text', placeholder: 'Customer Name (Optional)' },
        { name: 'items', type: 'text', placeholder: 'Items Sold' },
        { name: 'notes', type: 'text', placeholder: 'Notes' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Record',
          handler: (data) => {
            if (data.amount) {
              console.log('Recording sale:', data);
              // Implement record sale logic
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async recordPurchase() {
    const alert = await this.alertController.create({
      header: 'Record Purchase',
      inputs: [
        { name: 'amount', type: 'number', placeholder: 'Purchase Amount' },
        { name: 'vendor', type: 'text', placeholder: 'Vendor Name' },
        { name: 'items', type: 'text', placeholder: 'Items Purchased' },
        { name: 'notes', type: 'text', placeholder: 'Notes' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Record',
          handler: (data) => {
            if (data.amount) {
              console.log('Recording purchase:', data);
              // Implement record purchase logic
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async recordCredit() {
    const alert = await this.alertController.create({
      header: 'Credit Transaction',
      inputs: [
        { name: 'amount', type: 'number', placeholder: 'Credit Amount' },
        { name: 'party', type: 'text', placeholder: 'Customer/Vendor Name' },
        { name: 'reason', type: 'text', placeholder: 'Reason for Credit' },
        { name: 'notes', type: 'text', placeholder: 'Notes' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Record',
          handler: (data) => {
            if (data.amount) {
              console.log('Recording credit:', data);
              // Implement record credit logic
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async recordPayment() {
    const alert = await this.alertController.create({
      header: 'Payment Transaction',
      inputs: [
        { name: 'amount', type: 'number', placeholder: 'Payment Amount' },
        { name: 'party', type: 'text', placeholder: 'From/To' },
        { name: 'method', type: 'text', placeholder: 'Payment Method' },
        { name: 'notes', type: 'text', placeholder: 'Notes' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Record',
          handler: (data) => {
            if (data.amount) {
              console.log('Recording payment:', data);
              // Implement record payment logic
            }
          }
        }
      ]
    });
    await alert.present();
  }
}